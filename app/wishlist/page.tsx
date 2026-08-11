"use client";
import { useProducts } from "@/lib/use-products";
import { useStore } from "@/stores/use-store";
import { ProductGrid } from "@/components/product-grid";
import Link from "next/link";
export default function Page() {
  const { products } = useProducts();
  const ids = useStore((s) => s.wishlist),
    items = products.filter((p) => ids.includes(p.id));
  return (
    <div className="container section">
      <h1 className="section-title">Your wishlist</h1>
      <p className="mt-2 mb-8 muted">
        Save products and come back to them anytime.
      </p>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <div className="card p-12 text-center">
          Nothing saved yet.{" "}
          <Link className="font-bold underline" href="/shop">
            Explore products
          </Link>
        </div>
      )}
    </div>
  );
}
