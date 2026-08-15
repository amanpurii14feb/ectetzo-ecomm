import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  cart: z.record(z.string().regex(/^[1-9]\d{0,9}$/), z.coerce.number().int().min(1).max(99))
    .refine((cart) => Object.keys(cart).length <= 500, "Cart is too large."),
  wishlist: z.array(z.coerce.number().int().positive().max(2_147_483_647)).max(500)
    .transform((items) => [...new Set(items)]),
  merge: z.boolean().optional().default(false),
}).strict();

async function responseFor(userId: string) {
  const [cartRows, wishRows] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId }, select: { quantity: true, product: { select: { legacyId: true } } } }),
    prisma.wishlistItem.findMany({ where: { userId }, select: { product: { select: { legacyId: true } } } }),
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
      await Promise.all([
        tx.cartItem.createMany({ data: [...requestedCart].flatMap(([legacyId, quantity]) => {
          const product = valid.get(legacyId);
          return product?.stock ? [{ userId, productId: product.id, quantity: Math.min(quantity, product.stock, 99) }] : [];
        }) }),
        tx.wishlistItem.createMany({ data: [...requestedWishlist].flatMap((legacyId) => {
          const product = valid.get(legacyId);
          return product ? [{ userId, productId: product.id }] : [];
        }) }),
      ]);
      return;
    }
    const existingRows = await tx.cartItem.findMany({ where: { userId }, select: { productId: true, quantity: true } });
    const existingCart = new Map(existingRows.map((row) => [row.productId, row.quantity]));
    for (const [legacyId, quantity] of requestedCart) {
      const product = valid.get(legacyId);
      if (!product || product.stock < 1) continue;
      const safeQuantity = Math.min(quantity, product.stock, 99);
      await tx.cartItem.upsert({
          where: { userId_productId: { userId, productId: product.id } },
          create: { userId, productId: product.id, quantity: safeQuantity },
          update: { quantity: Math.min((existingCart.get(product.id) ?? 0) + safeQuantity, product.stock, 99) },
        });
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
