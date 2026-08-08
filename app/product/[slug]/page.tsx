import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { ProductDetail } from "@/components/product-detail";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params,
    p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  return <ProductDetail p={p} />;
}
