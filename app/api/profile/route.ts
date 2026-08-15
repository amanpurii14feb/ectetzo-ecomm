import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";

const schema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u, "Enter a valid full name."),
  phone: z.string().regex(/^[6-9]\d{9}$/).or(z.literal("")),
}).strict();

export async function GET() {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true, phone: true } });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const id = await currentUserId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid name and 10-digit phone number." }, { status: 400 });
  const user = await prisma.user.update({
    where: { id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
    select: { name: true, email: true, phone: true },
  });
  return NextResponse.json({ user });
}
