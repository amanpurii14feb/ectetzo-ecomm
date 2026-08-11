import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

export async function getStoreProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { legacyId: "asc" },
  });
  return rows.map((row) => ({
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
    specs: row.specs as Record<string, string>,
  }));
}
