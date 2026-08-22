import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  recoveryPassword: z.string().min(12).max(100),
  newPassword: z
    .string()
    .min(12)
    .max(100)
    .regex(/[a-z]/, "Add a lowercase letter.")
    .regex(/[A-Z]/, "Add an uppercase letter.")
    .regex(/\d/, "Add a number.")
    .regex(/[^A-Za-z0-9]/, "Add a special character."),
});
const attempts = new Map<string, { count: number; resetAt: number }>();
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid recovery details." },
      { status: 400 },
    );
  const now = Date.now(),
    rate = attempts.get(parsed.data.email);
  if (rate && rate.resetAt > now && rate.count >= 5)
    return NextResponse.json(
      { error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  const configured = Buffer.from(process.env.ADMIN_PASSWORD || ""),
    supplied = Buffer.from(parsed.data.recoveryPassword);
  const recoveryMatches =
    configured.length === supplied.length &&
    timingSafeEqual(configured, supplied);
  const admin = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, role: true },
  });
  if (!recoveryMatches || admin?.role !== "ADMIN") {
    attempts.set(
      parsed.data.email,
      rate && rate.resetAt > now
        ? { count: rate.count + 1, resetAt: rate.resetAt }
        : { count: 1, resetAt: now + 15 * 60_000 },
    );
    return NextResponse.json(
      { error: "The admin email or recovery password is incorrect." },
      { status: 403 },
    );
  }
  await prisma.user.update({
    where: { id: admin.id },
    data: { passwordHash: await hash(parsed.data.newPassword, 12) },
  });
  attempts.delete(parsed.data.email);
  return NextResponse.json({
    message: "Password updated successfully. You can now sign in.",
  });
}
