"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  Scale,
  Share2,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
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
  const router = useRouter();
  const add = useStore((s) => s.add),
    remove = useStore((s) => s.remove),
    setQuantity = useStore((s) => s.quantity),
    notify = useStore((s) => s.notify),
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
                unoptimized
              />
            )}
            {p.badge && (
              <span className="product-badge absolute left-3 top-3 z-10">
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
            aria-label={`Share ${p.name}`}
            title="Share product"
            onClick={async () => {
              const url = `${window.location.origin}/product/${p.slug}`;
              if (navigator.share) {
                try {
                  await navigator.share({ title: p.name, text: p.description, url });
                } catch (error) {
                  if (error instanceof DOMException && error.name === "AbortError") return;
                }
              } else {
                await navigator.clipboard.writeText(url);
                notify("Product link copied");
              }
            }}
          >
            <Share2 size={18} />
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
        <p className="product-list-description">{p.description}</p>
        <div className="product-list-assurance">
          <span className={p.stock > 0 ? "in-stock" : "out-of-stock"}>
            <CheckCircle2 size={14} />
            {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
          </span>
          <span>
            <Truck size={14} /> Fast dispatch
          </span>
        </div>
        <div className="product-card-price">
          <b className="text-lg">₹{p.price.toLocaleString("en-IN")}</b>
          <s className="text-xs muted">₹{p.mrp.toLocaleString("en-IN")}</s>
          <span className="product-discount">{off}% off</span>
        </div>
        {inCart ? (
          <div className="product-cart-stepper" aria-label={`${cartQuantity} in cart`}>
            <button
              type="button"
              onClick={() => cartQuantity === 1 ? remove(p.id) : setQuantity(p.id, cartQuantity - 1)}
              aria-label={`Remove one ${p.name}`}
            >
              <Minus size={17} />
            </button>
            <button type="button" onClick={() => router.push("/cart")} aria-label="Go to cart">
              <ShoppingCart size={19} />
              <span>{cartQuantity}</span>
            </button>
            <button type="button" onClick={() => add(p.id)} aria-label={`Add one more ${p.name}`}>
              <Plus size={17} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="product-cart-button"
            onClick={() => add(p.id)}
            aria-label={`Add ${p.name} to cart`}
          >
            <ShoppingCart size={20} />
            <span>Add to cart</span>
          </button>
        )}
      </div>
    </article>
  );
}
