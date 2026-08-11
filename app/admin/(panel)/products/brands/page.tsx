import { BrandsManager } from "@/admin/components/brands-manager";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [brands, grouped] = await Promise.all([
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
      prisma.product.groupBy({ by: ["brand"], _count: { _all: true } }),
    ]),
    counts = new Map(grouped.map((x) => [x.brand, x._count._all]));
  return (
    <BrandsManager
      initial={brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        active: b.active,
        products: counts.get(b.name) ?? 0,
      }))}
    />
  );
}
