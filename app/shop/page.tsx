import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function CatalogContent(){
  return <Catalog items={await getStoreProducts()} />;
}
export default function Page(){return <Suspense fallback={<CatalogSkeleton/>}><CatalogContent/></Suspense>}
