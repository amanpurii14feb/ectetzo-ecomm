"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Scale, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { useStore } from "@/stores/use-store";
export function ProductCard({
  p,
  comparing,
  onCompare,
}: {
  p: Product;
  comparing?: boolean;
  onCompare?: (id: number) => void;
}) {
  const add = useStore((s) => s.add),
    toggle = useStore((s) => s.toggleWish),
    wish = useStore((s) => s.wishlist.includes(p.id)),
    cartQuantity = useStore((s) => s.cart[p.id] || 0),
    inCart = cartQuantity > 0;
  const off = Math.round((1 - p.price / p.mrp) * 100);
  return (
    <article className="product-card card group overflow-hidden">
      <div className="product-visual-wrap">
        <Link href={"/product/" + p.slug} aria-label={`View ${p.name}`}>
          <div className="product-visual" style={{ background: p.color }}>
            {p.images?.[0] && (
              <Image
                src={p.images[0]}
                alt={p.name}
                width={600}
                height={600}
                sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
              />
            )}
            {p.badge && (
              <span className="absolute left-3 top-3 z-10 rounded bg-ink px-2 py-1 text-[10px] font-bold text-white">
                {p.badge}
              </span>
            )}
          </div>
        </Link>
        <div className="product-quick-actions">
          <button
            type="button"
            aria-label={wish ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wish}
            title={wish ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggle(p.id)}
          >
            <Heart size={18} fill={wish ? "#f6b800" : "none"} />
          </button>
          <button
            type="button"
            className={inCart ? "active" : ""}
            aria-label={
              inCart
                ? `Add one more ${p.name}. ${cartQuantity} currently in cart`
                : `Add ${p.name} to cart`
            }
            title={inCart ? "Add one more" : "Quick add to cart"}
            onClick={() => add(p.id)}
          >
            <ShoppingBag size={18} />
            {inCart && <span>{cartQuantity}</span>}
          </button>
        </div>
      </div>
      {onCompare && (
        <button
          className={`product-compare ${comparing ? "active" : ""}`}
          onClick={() => onCompare(p.id)}
          aria-pressed={comparing}
        >
          <Scale size={13} />
          {comparing ? "Added to compare" : "Compare"}
        </button>
      )}
      <div className="product-card-content">
        <span className="eyebrow">{p.brand}</span>
        <Link href={"/product/" + p.slug} className="product-card-title">
          {p.name}
        </Link>
        <div className="product-card-rating">
          <Star size={14} fill="#f6b800" color="#f6b800" />
          <b>{p.rating}</b>
          <span className="muted">({p.reviews})</span>
        </div>
        <div className="product-card-price">
          <b className="text-lg">₹{p.price.toLocaleString("en-IN")}</b>
          <s className="text-xs muted">₹{p.mrp.toLocaleString("en-IN")}</s>
          <span className="text-xs font-bold text-green-700">{off}% off</span>
        </div>
      </div>
    </article>
  );
}
