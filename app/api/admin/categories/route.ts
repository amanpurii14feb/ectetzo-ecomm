import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { categorySchema } from "@/lib/category-schema";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
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
  try {
    const category = await prisma.category.create({ data: parsed.data });
    revalidatePath("/", "layout");
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "Category name or slug already exists." },
        { status: 409 },
      );
    throw error;
  }
}
