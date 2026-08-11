import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return (
    <Catalog
      initialCategory={slug}
      initialCategoryName={category?.name}
      items={await getStoreProducts()}
    />
  );
}
