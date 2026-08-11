import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { categorySchema } from "@/lib/category-schema";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = categorySchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category." },
      { status: 400 },
    );
  const { id } = await params;
  const current = await prisma.category.findUnique({ where: { id } });
  if (!current)
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  try {
    const [, category] = await prisma.$transaction([
      prisma.product.updateMany({
        where: { category: current.name },
        data: { category: parsed.data.name },
      }),
      prisma.category.update({ where: { id }, data: parsed.data }),
    ]);
    revalidatePath("/", "layout");
    return NextResponse.json({ category });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "Category name or slug already exists." },
        { status: 409 },
      );
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category)
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  const products = await prisma.product.count({
    where: { category: category.name },
  });
  if (products)
    return NextResponse.json(
      {
        error: `Move or delete ${products} linked product${products === 1 ? "" : "s"} first.`,
      },
      { status: 409 },
    );
  await prisma.category.delete({ where: { id } });
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
