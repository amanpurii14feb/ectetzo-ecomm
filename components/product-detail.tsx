"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useStore } from "@/stores/use-store";
import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  X,
  ZoomIn,
} from "lucide-react";
import { ProductGrid } from "./product-grid";
import { products } from "@/data/products";
import { useRouter } from "next/navigation";
export function ProductDetail({ p }: { p: Product }) {
  const [q, setQ] = useState(1),
    [tab, setTab] = useState("Description"),
    [pin, setPin] = useState(""),
    [selectedImage, setSelectedImage] = useState(p.images?.[0]),
    [zooming, setZooming] = useState(false),
    [zoomPoint, setZoomPoint] = useState({ x: 50, y: 50 }),
    [lightbox, setLightbox] = useState(false);
  const router = useRouter();
  const add = useStore((s) => s.add),
    setQuantity = useStore((s) => s.quantity),
    toggle = useStore((s) => s.toggleWish),
    cartQuantity = useStore((s) => s.cart[p.id] || 0),
    hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) setQ(cartQuantity || 1);
  }, [cartQuantity, hydrated]);
  useEffect(() => {
    if (!lightbox) return;
    const close = (event: KeyboardEvent) =>
      event.key === "Escape" && setLightbox(false);
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [lightbox]);
  const syncCart = () => {
    if (cartQuantity) {
      setQuantity(p.id, q);
      useStore.getState().notify("Cart quantity updated");
    } else {
      add(p.id, q);
    }
  };
  const categorySlug = p.category.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="container section">
      <nav className="product-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/category/${categorySlug}`}>{p.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{p.name}</span>
      </nav>
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="product-gallery">
          <div
            className={`product-visual product-zoom h-[430px] rounded-xl ${selectedImage ? "has-image" : ""} ${zooming ? "zooming" : ""}`}
            style={{ background: p.color }}
            onMouseEnter={() => selectedImage && setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              setZoomPoint({
                x: ((event.clientX - box.left) / box.width) * 100,
                y: ((event.clientY - box.top) / box.height) * 100,
              });
            }}
            onClick={() => selectedImage && setLightbox(true)}
          >
            {selectedImage && (
              <img
                src={selectedImage}
                alt={p.name}
                style={{ transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%` }}
              />
            )}
            {selectedImage && (
              <span className="product-zoom-hint">
                <ZoomIn /> Click to enlarge
              </span>
            )}
          </div>
          {zooming && selectedImage && (
            <div
              className="product-zoom-panel"
              style={{
                backgroundImage: `url(${selectedImage})`,
                backgroundPosition: `${zoomPoint.x}% ${zoomPoint.y}%`,
              }}
              aria-hidden="true"
            />
          )}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(p.images?.length
              ? p.images
              : [undefined, undefined, undefined, undefined]
            ).map((image, n) => (
              <button
                type="button"
                key={n}
                className={`product-visual h-20 rounded ${image ? "has-image" : ""} ${image === selectedImage ? "selected" : ""}`}
                style={{ background: p.color }}
                onClick={() => image && setSelectedImage(image)}
              >
                {image && <img src={image} alt={`${p.name} view ${n + 1}`} />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow">{p.brand}</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{p.name}</h1>
          <div className="mt-3 flex gap-3 text-sm">
            <span className="flex gap-1">
              <Star size={16} fill="#f6b800" color="#f6b800" /> {p.rating} (
              {p.reviews} reviews)
            </span>
            <span className="muted">
              SKU: VZ-{String(p.id).padStart(5, "0")}
            </span>
          </div>
          <div className="my-6 border-y py-5">
            <span className="text-3xl font-black">
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            <s className="ml-3 muted">₹{p.mrp.toLocaleString("en-IN")}</s>
            <span className="ml-3 rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-700">
              {Math.round((1 - p.price / p.mrp) * 100)}% OFF
            </span>
            <p className="mt-1 text-xs muted">Inclusive of all taxes</p>
          </div>
          <p className="leading-7 muted">{p.description}</p>
          <p className="mt-5 font-bold text-green-700">
            ● In stock · {p.stock} available
          </p>
          <div className="mt-5 flex gap-3">
            <div className="flex items-center rounded border">
              <button
                className="p-3"
                onClick={() => setQ(Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <b className="w-9 text-center" aria-live="polite">
                {q}
              </b>
              <button
                className="p-3"
                onClick={() => setQ(Math.min(p.stock, q + 1))}
                disabled={q >= p.stock}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <button onClick={syncCart} className="btn btn-yellow flex-1">
              {cartQuantity ? "Update Cart" : "Add to Cart"}
            </button>
            <button onClick={() => toggle(p.id)} className="btn btn-outline">
              <Heart />
            </button>
          </div>
          <button
            onClick={() => {
              syncCart();
              router.push("/checkout");
            }}
            className="btn btn-dark mt-3 w-full"
          >
            Buy Now
          </button>
          <div className="mt-6 flex gap-2">
            <input
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="field"
              placeholder="Enter PIN code"
            />
            <button
              onClick={() =>
                useStore
                  .getState()
                  .notify(
                    pin.length === 6
                      ? "Delivery available in 3–5 working days"
                      : "Enter a valid 6-digit PIN code",
                  )
              }
              className="btn btn-outline"
            >
              Check
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <span className="flex gap-2">
              <Truck /> Fast dispatch
            </span>
            <span className="flex gap-2">
              <ShieldCheck /> Genuine product
            </span>
          </div>
        </div>
      </div>
      <div className="mt-16 border-b flex gap-6 overflow-auto">
        {[
          "Description",
          "Specifications",
          "Features",
          "Reviews",
          "Shipping & Returns",
        ].map((t) => (
          <button
            onClick={() => setTab(t)}
            className={
              "whitespace-nowrap pb-3 font-bold " +
              (tab === t ? "border-b-2 border-volt" : "muted")
            }
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="py-7 leading-7 muted">
        {tab === "Specifications"
          ? Object.entries(p.specs).map(([k, v]) => (
              <div className="grid max-w-xl grid-cols-2 border-b py-2" key={k}>
                <b className="text-ink">{k}</b>
                <span>{v}</span>
              </div>
            ))
          : tab === "Reviews"
            ? `Rated ${p.rating} out of 5 by ${p.reviews} verified customers.`
            : `${p.description} Built to meet demanding applications with consistent performance, dependable materials and straightforward installation.`}
      </div>
      <h2 className="section-title mb-8 mt-10">Similar products</h2>
      <ProductGrid
        items={products
          .filter((x) => x.category === p.category && x.id !== p.id)
          .slice(0, 4)}
      />
      {lightbox && selectedImage && (
        <div
          className="product-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${p.name} image preview`}
          onMouseDown={(event) =>
            event.target === event.currentTarget && setLightbox(false)
          }
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close image preview"
          >
            <X />
          </button>
          <img src={selectedImage} alt={p.name} />
        </div>
      )}
    </div>
  );
}
