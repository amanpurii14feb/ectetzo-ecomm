import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
export function ProductGrid({
  items,
  view = "grid",
  compareIds,
  onCompare,
}: {
  items: Product[];
  view?: "grid" | "list";
  compareIds?: number[];
  onCompare?: (id: number) => void;
}) {
  return (
    <div className={view === "list" ? "list-products" : "grid-products"}>
      {items.map((p) => (
        <ProductCard
          key={p.id}
          p={p}
          comparing={compareIds?.includes(p.id)}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}
