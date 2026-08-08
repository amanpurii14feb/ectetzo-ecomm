"use client";
import Link from "next/link";
import { Check, Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/stores/use-store";
export function ProductCard({ p }: { p: Product }) {
  const add = useStore((s) => s.add),
    toggle = useStore((s) => s.toggleWish),
    wish = useStore((s) => s.wishlist.includes(p.id)),
    inCart = useStore((s) => Boolean(s.cart[p.id]));
  const off = Math.round((1 - p.price / p.mrp) * 100);
  return (
    <article className="product-card card group overflow-hidden">
      <Link href={"/product/" + p.slug}>
        <div className="product-visual" style={{ background: p.color }}>
          {p.badge && (
            <span className="absolute left-3 top-3 z-10 rounded bg-ink px-2 py-1 text-[10px] font-bold text-white">
              {p.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex justify-between">
          <span className="eyebrow">{p.brand}</span>
          <button className="icon-button" aria-label={wish ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggle(p.id)}>
            <Heart size={18} fill={wish ? "#f6b800" : "none"} />
          </button>
        </div>
        <Link
          href={"/product/" + p.slug}
          className="mt-2 block min-h-10 text-sm font-bold leading-5"
        >
          {p.name}
        </Link>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star size={14} fill="#f6b800" color="#f6b800" />
          <b>{p.rating}</b>
          <span className="muted">({p.reviews})</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <b className="text-lg">₹{p.price.toLocaleString("en-IN")}</b>
          <s className="text-xs muted">₹{p.mrp.toLocaleString("en-IN")}</s>
          <span className="text-xs font-bold text-green-700">{off}% off</span>
        </div>
        <p className="mb-3 mt-1 text-xs font-bold text-green-700">● In stock</p>
        <button
          onClick={() => add(p.id)}
          className={`btn w-full py-2.5 text-sm ${inCart ? "btn-yellow" : "btn-dark"}`}
        >
          {inCart ? <Check size={17} /> : <ShoppingCart size={17} />} {inCart ? "Add another" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
