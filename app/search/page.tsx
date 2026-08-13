import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Suspense } from "react";
export const dynamic = "force-dynamic";
async function CatalogContent({q}:{q:string}){
  return <Catalog query={q || ""} items={await getStoreProducts()} />;
}
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const {q}=await searchParams;return <Suspense fallback={<CatalogSkeleton/>}><CatalogContent q={q||""}/></Suspense>}
