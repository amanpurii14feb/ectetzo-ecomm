"use client";
import { useProducts } from "@/lib/use-products";
import { useStore } from "@/stores/use-store";
import { ProductGrid } from "@/components/product-grid";
import Link from "next/link";
import { AccountShell } from "@/components/account-shell";
import { ShoppingCart, Share2 } from "lucide-react";
export default function Page() {
  const { products } = useProducts();
  const ids = useStore((s) => s.wishlist),
    items = products.filter((p) => ids.includes(p.id));
  return (
    <AccountShell><div className="wishlist-page">
      <div className="account-section-heading"><div><h1>Wishlist</h1><p>Your saved products</p></div><div className="wishlist-actions"><button className="btn btn-outline" onClick={()=>items.forEach(p=>useStore.getState().add(p.id))}><ShoppingCart/> Move all to cart</button><button className="btn btn-outline" onClick={()=>navigator.clipboard?.writeText(location.href)}><Share2/> Share wishlist</button></div></div>
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
    </div></AccountShell>
  );
}
