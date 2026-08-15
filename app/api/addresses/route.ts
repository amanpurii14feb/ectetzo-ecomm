import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";

const addressSchema = z.object({
  label: z.string().trim().min(2).max(20).default("HOME"),
  name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  line1: z.string().trim().min(8).max(200),
  city: z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u),
  state: z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u),
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid PIN code."),
  isDefault: z.boolean().default(false),
}).strict();

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json({ addresses });
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = addressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address." }, { status: 400 });
  const address = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...parsed.data, userId } });
  });
  return NextResponse.json({ address }, { status: 201 });
}
