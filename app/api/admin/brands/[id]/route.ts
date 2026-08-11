import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { brandSchema } from "@/lib/brand-schema";
import { prisma } from "@/lib/prisma";
type C = { params: Promise<{ id: string }> };
export async function PUT(request: Request, { params }: C) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = brandSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid brand." },
      { status: 400 },
    );
  const { id } = await params,
    current = await prisma.brand.findUnique({ where: { id } });
  if (!current)
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  try {
    const [, brand] = await prisma.$transaction([
      prisma.product.updateMany({
        where: { brand: current.name },
        data: { brand: parsed.data.name },
      }),
      prisma.brand.update({ where: { id }, data: parsed.data }),
    ]);
    revalidatePath("/", "layout");
    return NextResponse.json({ brand });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "Brand name or slug already exists." },
        { status: 409 },
      );
    throw error;
  }
}
export async function DELETE(_request: Request, { params }: C) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params,
    brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand)
    return NextResponse.json({ error: "Brand not found." }, { status: 404 });
  const products = await prisma.product.count({ where: { brand: brand.name } });
  if (products)
    return NextResponse.json(
      {
        error: `Move or delete ${products} linked product${products === 1 ? "" : "s"} first.`,
      },
      { status: 409 },
    );
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
