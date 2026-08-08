import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/current-user";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await prisma.address.deleteMany({ where: { id, userId } });
  if (!result.count) return NextResponse.json({ error: "Address not found." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
