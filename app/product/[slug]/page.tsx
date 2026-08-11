import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getStoreProducts } from "@/lib/store-products";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    products = await getStoreProducts(),
    p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  return (
    <ProductDetail
      p={p}
      related={products
        .filter((x) => x.category === p.category && x.id !== p.id)
        .slice(0, 4)}
    />
  );
}
