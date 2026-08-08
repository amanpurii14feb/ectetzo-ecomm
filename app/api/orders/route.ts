import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";

const orderSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  name: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pin: z.string().regex(/^\d{6}$/),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1),
});

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in before checkout." }, { status: 401 });
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });

  const requested = new Map(parsed.data.items.map((item) => [item.productId, item.quantity]));
  const products = await prisma.product.findMany({ where: { legacyId: { in: [...requested.keys()] }, active: true } });
  if (products.length !== requested.size) return NextResponse.json({ error: "One or more products are unavailable." }, { status: 400 });
  for (const product of products) {
    if (product.stock < (requested.get(product.legacyId) ?? 0)) {
      return NextResponse.json({ error: `${product.name} has insufficient stock.` }, { status: 409 });
    }
  }

  const subtotal = products.reduce((sum, product) => sum + product.price * (requested.get(product.legacyId) ?? 0), 0);
  const orderNumber = `VZ${Date.now().toString(36).toUpperCase()}`;
  const order = await prisma.$transaction(async (tx) => {
    for (const product of products) {
      await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: requested.get(product.legacyId) ?? 0 } } });
    }
    return tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        total: subtotal,
        contactEmail: parsed.data.email,
        contactPhone: parsed.data.phone,
        shippingName: parsed.data.name,
        addressLine1: parsed.data.address,
        city: parsed.data.city,
        state: parsed.data.state,
        pin: parsed.data.pin,
        items: { create: products.map((product) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: requested.get(product.legacyId) ?? 0,
        })) },
      },
      include: { items: true },
    });
  });
  return NextResponse.json({ order }, { status: 201 });
}
