import { Catalog } from "@/components/catalog";
import { getStoreProducts } from "@/lib/store-products";
import { prisma } from "@/lib/prisma";
import { CatalogSkeleton } from "@/components/catalog-skeleton";
import { Suspense } from "react";
export const dynamic = "force-dynamic";
async function CatalogContent({slug}:{slug:string}){
  const category = await prisma.category.findUnique({ where: { slug } });
  return (
    <Catalog
      initialCategory={slug}
      initialCategoryName={category?.name}
      items={await getStoreProducts()}
    />
  );
}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <Suspense fallback={<CatalogSkeleton/>}><CatalogContent slug={slug}/></Suspense>}
