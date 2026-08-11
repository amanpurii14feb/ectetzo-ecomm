import { CategoriesManager } from "@/admin/components/categories-manager";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((x) => [x.category, x._count._all]));
  return (
    <CategoriesManager
      initial={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        active: c.active,
        products: counts.get(c.name) ?? 0,
      }))}
    />
  );
}
