import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Catalog initialCategory={slug} items={await getStoreProducts()} />;
}
