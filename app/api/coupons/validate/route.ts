import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { couponError, validateCoupon } from "@/lib/coupons";
const schema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(20),
  subtotal: z.number().int().positive(),
});
export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId)
    return NextResponse.json(
      { error: "Please sign in to apply a coupon." },
      { status: 401 },
    );
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid coupon code." },
      { status: 400 },
    );
  try {
    const { coupon, discount } = await validateCoupon(
      prisma,
      parsed.data.code,
      userId,
      parsed.data.subtotal,
    );
    return NextResponse.json({
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (error) {
    return NextResponse.json({ error: couponError(error) }, { status: 400 });
  }
}
