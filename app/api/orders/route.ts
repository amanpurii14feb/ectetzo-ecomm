import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";
import { couponError, validateCoupon } from "@/lib/coupons";

const orderSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
    name: z.string().trim().min(2).max(80),
    address: z.string().trim().min(8).max(200),
    city: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[\p{L} .'-]+$/u, "Enter a valid city."),
    state: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[\p{L} .'-]+$/u, "Enter a valid state."),
    pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid PIN code."),
    coupon: z.string().trim().toUpperCase().max(20).optional(),
    items: z
      .array(
        z
          .object({
            productId: z.number().int().positive().max(2_147_483_647),
            quantity: z.number().int().min(1).max(20),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .refine(
    (data) =>
      new Set(data.items.map((item) => item.productId)).size ===
      data.items.length,
    {
      message: "Duplicate products are not allowed.",
      path: ["items"],
    },
  );

export async function GET() {
  const userId = await currentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId)
    return NextResponse.json(
      { error: "Please sign in before checkout." },
      { status: 401 },
    );
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid checkout details." },
      { status: 400 },
    );

  const requested = new Map(
    parsed.data.items.map((item) => [item.productId, item.quantity]),
  );
  const orderNumber = `VZ${Date.now().toString(36).toUpperCase()}`;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { legacyId: { in: [...requested.keys()] }, active: true },
      });
      if (products.length !== requested.size) throw new Error("UNAVAILABLE");
      for (const product of products) {
        const quantity = requested.get(product.legacyId) ?? 0;
        const changed = await tx.product.updateMany({
          where: { id: product.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (!changed.count) throw new Error(`STOCK:${product.name}`);
      }
      const subtotal = products.reduce(
        (sum, product) =>
          sum + product.price * (requested.get(product.legacyId) ?? 0),
        0,
      );
      const validated = parsed.data.coupon
        ? await validateCoupon(tx, parsed.data.coupon, userId, subtotal)
        : null;
      const discount = validated?.discount ?? 0;
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discount,
          total: subtotal - discount,
          couponId: validated?.coupon.id,
          couponCode: validated?.coupon.code,
          contactEmail: parsed.data.email,
          contactPhone: parsed.data.phone,
          shippingName: parsed.data.name,
          addressLine1: parsed.data.address,
          city: parsed.data.city,
          state: parsed.data.state,
          pin: parsed.data.pin,
          items: {
            create: products.map((product) => ({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: requested.get(product.legacyId) ?? 0,
            })),
          },
        },
        include: { items: true },
      });
      if (validated)
        await tx.couponRedemption.create({
          data: {
            couponId: validated.coupon.id,
            userId,
            orderId: order.id,
            discount,
          },
        });
      return order;
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UNAVAILABLE")
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 },
      );
    if (message.startsWith("STOCK:"))
      return NextResponse.json(
        { error: `${message.slice(6)} has insufficient stock.` },
        { status: 409 },
      );
    if (message.startsWith("COUPON_"))
      return NextResponse.json({ error: couponError(error) }, { status: 400 });
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    )
      return NextResponse.json(
        { error: "This coupon has already been used by your account." },
        { status: 409 },
      );
    throw error;
  }
}
