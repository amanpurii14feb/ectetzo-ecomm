import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";
import { unstable_cache } from "next/cache";

const loadStoreProducts = unstable_cache(async (): Promise<Product[]> => {
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: { legacyId: "asc" },
    select: {
      legacyId: true, slug: true, name: true, brand: true, category: true,
      price: true, mrp: true, rating: true, reviews: true, stock: true,
      badge: true, color: true, images: true, description: true, specs: true,
    },
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
}, ["store-products"], { revalidate: 60, tags: ["store-products"] });

export async function getStoreProducts(): Promise<Product[]> {
  return loadStoreProducts();
}
