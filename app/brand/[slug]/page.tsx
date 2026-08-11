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
  const brand = await prisma.brand.findUnique({ where: { slug } });
  return (
    <Catalog
      query={brand?.name ?? slug.replaceAll("-", " ")}
      items={await getStoreProducts()}
    />
  );
}
