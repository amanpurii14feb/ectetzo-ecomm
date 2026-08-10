import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { productSchema } from "@/lib/product-schema";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stock = Number(body?.stock);
  if (!Number.isInteger(stock) || stock < 0) return NextResponse.json({ error: "Invalid stock quantity." }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: { stock } });
  return NextResponse.json({ product });
}

export async function PUT(request: Request, { params }: Context) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product." }, { status: 400 });
  try {
    const product = await prisma.product.update({ where: { id }, data: { ...parsed.data, badge: parsed.data.badge || null } });
    return NextResponse.json({ product });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") return NextResponse.json({ error: "This slug is already in use." }, { status: 409 });
    if (code === "P2025") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const orderItems = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItems) {
    const product = await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ product, archived: true, message: "Product has order history, so it was archived instead of permanently deleted." });
  }
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    throw error;
  }
}
