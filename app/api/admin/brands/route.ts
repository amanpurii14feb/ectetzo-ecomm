import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdmin } from "@/lib/admin";
import { brandSchema } from "@/lib/brand-schema";
import { prisma } from "@/lib/prisma";
export async function GET() {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({
    brands: await prisma.brand.findMany({ orderBy: { name: "asc" } }),
  });
}
export async function POST(request: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = brandSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid brand." },
      { status: 400 },
    );
  try {
    const brand = await prisma.brand.create({ data: parsed.data });
    revalidatePath("/", "layout");
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002")
      return NextResponse.json(
        { error: "Brand name or slug already exists." },
        { status: 409 },
      );
    throw error;
  }
}
