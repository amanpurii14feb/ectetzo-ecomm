import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductEditor } from "@/admin/components/product-editor";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [p, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { active: true },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { active: true },
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!p) notFound();
  return (
    <ProductEditor
      categories={categories.map((category) => category.name)}
      brands={brands.map((brand) => brand.name)}
      product={{
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        costPrice: p.costPrice,
        barcode: p.barcode,
        weightKg: p.weightKg,
        dimensions: p.dimensions,
        tags: p.tags,
        rating: p.rating,
        reviews: p.reviews,
        badge: p.badge,
        color: p.color,
        images: p.images,
        active: p.active,
        specs: p.specs as Record<string, string>,
      }}
    />
  );
}
