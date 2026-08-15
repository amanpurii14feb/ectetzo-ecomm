import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStoreProducts } from "@/lib/store-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  if ((q && (q.length < 2 || q.length > 100)) || (category && category.length > 80))
    return NextResponse.json({ error: "Invalid search query." }, { status: 400 });
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
    take: q ? 20 : undefined,
    select: {
      legacyId: true, slug: true, name: true, brand: true, category: true,
      price: true, mrp: true, rating: true, reviews: true, stock: true,
      badge: true, color: true, images: true, description: true, specs: true,
    },
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
