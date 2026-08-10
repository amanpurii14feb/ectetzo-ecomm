import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  cart: z.record(z.string(), z.coerce.number().int().min(1).max(99)),
  wishlist: z.array(z.coerce.number().int().positive()).max(500),
  merge: z.boolean().optional().default(false),
});

async function responseFor(userId: string) {
  const [cartRows, wishRows] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId }, include: { product: true } }),
    prisma.wishlistItem.findMany({ where: { userId }, include: { product: true } }),
  ]);
  return {
    cart: Object.fromEntries(cartRows.map((row) => [row.product.legacyId, row.quantity])),
    wishlist: wishRows.map((row) => row.product.legacyId),
  };
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await responseFor(userId));
}

export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart or wishlist data." }, { status: 400 });

  const requestedCart = new Map(Object.entries(parsed.data.cart).map(([id, quantity]) => [Number(id), quantity]));
  const requestedWishlist = new Set(parsed.data.wishlist);
  const legacyIds = [...new Set([...requestedCart.keys(), ...requestedWishlist])];
  const products = legacyIds.length
    ? await prisma.product.findMany({ where: { legacyId: { in: legacyIds }, active: true }, select: { id: true, legacyId: true, stock: true } })
    : [];
  const valid = new Map(products.map((product) => [product.legacyId, product]));

  await prisma.$transaction(async (tx) => {
    if (!parsed.data.merge) {
      await Promise.all([
        tx.cartItem.deleteMany({ where: { userId } }),
        tx.wishlistItem.deleteMany({ where: { userId } }),
      ]);
    }
    for (const [legacyId, quantity] of requestedCart) {
      const product = valid.get(legacyId);
      if (!product || product.stock < 1) continue;
      const safeQuantity = Math.min(quantity, product.stock, 99);
      if (parsed.data.merge) {
        const existing = await tx.cartItem.findUnique({ where: { userId_productId: { userId, productId: product.id } } });
        await tx.cartItem.upsert({
          where: { userId_productId: { userId, productId: product.id } },
          create: { userId, productId: product.id, quantity: safeQuantity },
          update: { quantity: Math.min((existing?.quantity ?? 0) + safeQuantity, product.stock, 99) },
        });
      } else {
        await tx.cartItem.create({ data: { userId, productId: product.id, quantity: safeQuantity } });
      }
    }
    for (const legacyId of requestedWishlist) {
      const product = valid.get(legacyId);
      if (!product) continue;
      await tx.wishlistItem.upsert({
        where: { userId_productId: { userId, productId: product.id } },
        create: { userId, productId: product.id },
        update: {},
      });
    }
  });
  return NextResponse.json(await responseFor(userId));
}
