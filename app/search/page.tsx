import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <Catalog query={q || ""} items={await getStoreProducts()} />;
}
