import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[\p{L} .'-]+$/u, "Enter a valid full name."),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100)
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/\d/, "Password must include a number."),
}).strict();

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please enter valid account details." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });
  }
  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, passwordHash },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json({ user }, { status: 201 });
}
