import { Catalog } from "@/components/catalog";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <Catalog query={q || ""} />;
}
