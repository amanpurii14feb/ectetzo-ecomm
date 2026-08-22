import type { Coupon, Prisma } from "@prisma/client";

type Db = Prisma.TransactionClient | import("@prisma/client").PrismaClient;
export function couponDiscount(coupon: Coupon, subtotal: number) {
  const raw =
    coupon.type === "PERCENTAGE"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;
  return Math.max(0, Math.min(raw, coupon.maxDiscount ?? raw, subtotal));
}
export async function validateCoupon(
  db: Db,
  code: string,
  userId: string,
  subtotal: number,
) {
  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!coupon || !coupon.active) throw new Error("COUPON_INVALID");
  const now = new Date();
  if (
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.expiresAt && coupon.expiresAt < now)
  )
    throw new Error("COUPON_EXPIRED");
  if (subtotal < coupon.minSubtotal)
    throw new Error(`COUPON_MIN:${coupon.minSubtotal}`);
  const [usedByUser, totalUses] = await Promise.all([
    db.couponRedemption.findUnique({
      where: { couponId_userId: { couponId: coupon.id, userId } },
      select: { id: true },
    }),
    coupon.usageLimit === null
      ? Promise.resolve(0)
      : db.couponRedemption.count({ where: { couponId: coupon.id } }),
  ]);
  if (usedByUser) throw new Error("COUPON_USED");
  if (coupon.usageLimit !== null && totalUses >= coupon.usageLimit)
    throw new Error("COUPON_LIMIT");
  return { coupon, discount: couponDiscount(coupon, subtotal) };
}
export function couponError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "COUPON_USED") return "You have already used this coupon.";
  if (message === "COUPON_EXPIRED")
    return "This coupon has expired or is not active yet.";
  if (message === "COUPON_LIMIT")
    return "This coupon has reached its usage limit.";
  if (message.startsWith("COUPON_MIN:"))
    return `Minimum order value is ₹${Number(message.slice(11)).toLocaleString("en-IN")}.`;
  return "This coupon is invalid or inactive.";
}
