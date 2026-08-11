import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreProducts } from "@/lib/store-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  if (!q && !category)
    return NextResponse.json({ products: await getStoreProducts() });
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { brand: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { legacyId: "asc" },
  });
  const products = rows.map((row) => ({
    id: row.legacyId,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    mrp: row.mrp,
    rating: row.rating,
    reviews: row.reviews,
    stock: row.stock,
    badge: row.badge ?? undefined,
    color: row.color ?? "#e5e7e8",
    images: row.images,
    description: row.description,
    specs: row.specs,
  }));
  return NextResponse.json({ products });
}
