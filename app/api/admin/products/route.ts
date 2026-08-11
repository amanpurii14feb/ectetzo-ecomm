import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/admin";
import { productSchema } from "@/lib/product-schema";
import { revalidatePath } from "next/cache";

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = productSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product." },
      { status: 400 },
    );
  const latest = await prisma.product.aggregate({ _max: { legacyId: true } });
  try {
    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        badge: parsed.data.badge || null,
        legacyId: (latest._max.legacyId ?? 0) + 1,
      },
    });
    revalidatePath("/", "layout");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "This slug is already in use." },
        { status: 409 },
      );
    throw error;
  }
}
