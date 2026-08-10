import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findFirst({
    where: { id: session.user.id, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");
  const admin = await prisma.user.findFirst({
    where: { id: session.user.id, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!admin) redirect("/account?error=admin-access-required");
  return admin;
}
