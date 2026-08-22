import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";
import nextDynamic from "next/dynamic";
export const dynamic = "force-dynamic";

const ProductDetail = nextDynamic(
  () => import("@/components/product-detail").then((module) => module.ProductDetail),
  {
    loading: () => (
      <div className="container section" aria-busy="true" aria-label="Loading product">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    ),
  },
);

const toProduct = (row: Awaited<ReturnType<typeof prisma.product.findUnique>>): Product | null => row && ({
  id: row.legacyId, slug: row.slug, name: row.name, brand: row.brand,
  category: row.category, price: row.price, mrp: row.mrp, rating: row.rating,
  reviews: row.reviews, stock: row.stock, badge: row.badge ?? undefined,
  color: row.color ?? "#e5e7e8", images: row.images,
  description: row.description, specs: row.specs as Record<string, string>,
});

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const row = await prisma.product.findUnique({ where: { slug } });
  const p = toProduct(row);
  if (!p) notFound();
  const relatedRows = await prisma.product.findMany({
    where: { active: true, category: p.category, id: { not: row!.id } },
    orderBy: { legacyId: "asc" },
    take: 4,
  });
  return (
    <ProductDetail
      p={p}
      openReviews={query.review === "1"}
      related={relatedRows.map(toProduct).filter((item): item is Product => item !== null)}
    />
  );
}
