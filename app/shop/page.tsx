import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";

export const dynamic = "force-dynamic";

export default async function Page() {
  return <Catalog items={await getStoreProducts()} />;
}
