import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(q
        ? { OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
          ] }
        : {}),
    },
    orderBy: { legacyId: "asc" },
  });
  return NextResponse.json({ products });
}
