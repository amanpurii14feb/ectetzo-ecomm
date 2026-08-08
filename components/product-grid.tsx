import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
export function ProductGrid({ items, view = "grid" }: { items: Product[]; view?: "grid" | "list" }) {
  return (
    <div className={view === "list" ? "list-products" : "grid-products"}>
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
