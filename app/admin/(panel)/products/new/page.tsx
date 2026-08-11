import { ProductEditor } from "@/admin/components/product-editor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [categoryRows, brandRows] = await Promise.all([
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
  const categories = categoryRows.map((category) => category.name);
  const brands = brandRows.map((brand) => brand.name);
  return <ProductEditor categories={categories} brands={brands} />;
}
