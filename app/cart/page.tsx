"use client";
import Link from "next/link";
import { products } from "@/data/products";
import { useStore } from "@/stores/use-store";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
export default function Cart() {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const cart = useStore((s) => s.cart),
    hydrated = useStore((s) => s.hydrated),
    remove = useStore((s) => s.remove),
    qty = useStore((s) => s.quantity),
    toggle = useStore((s) => s.toggleWish);
  const items = products.filter((p) => cart[p.id]);
  const subtotal = items.reduce((a, p) => a + p.price * cart[p.id], 0),
    shipping = subtotal >= 999 ? 0 : 99,
    gst = Math.round(subtotal * 0.18),
    total = subtotal + shipping - discount;
  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === "ELECTZO10") { setDiscount(Math.min(Math.round(subtotal * .1), 500)); useStore.getState().notify("Coupon applied — you saved up to ₹500"); }
    else { setDiscount(0); useStore.getState().notify("Invalid coupon. Try ELECTZO10"); }
  };
  return (
    <div className="container section">
      <h1 className="section-title">Your cart</h1>
      {!hydrated ? (
        <div className="py-24 text-center muted">Loading your cart...</div>
      ) : !items.length ? (
        <div className="py-24 text-center">
          <ShoppingBag className="mx-auto" size={50} />
          <h2 className="mt-5 text-2xl font-black">Your cart is empty</h2>
          <p className="mt-2 muted">
            Let’s find the right electrical essentials.
          </p>
          <Link className="btn btn-yellow mt-6" href="/shop">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((p) => (
              <div className="card flex gap-4 p-4" key={p.id}>
                <div
                  className="product-visual h-28 w-28 shrink-0 rounded"
                  style={{ background: p.color }}
                />
                <div className="flex-1">
                  <span className="eyebrow">{p.brand}</span>
                  <Link href={"/product/" + p.slug} className="block font-bold">
                    {p.name}
                  </Link>
                  <b className="mt-2 block">
                    ₹{p.price.toLocaleString("en-IN")}
                  </b>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      aria-label="Quantity"
                      type="number"
                      min="1"
                      value={cart[p.id]}
                      onChange={(e) => qty(p.id, Number(e.target.value))}
                      className="field w-20 py-2"
                    />
                    <button
                      onClick={() => toggle(p.id)}
                      className="text-xs font-bold"
                    >
                      Move to wishlist
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-xs font-bold text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit p-6">
            <h2 className="text-xl font-black">Order summary</h2>
            <div className="mt-5 flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="field" placeholder="Coupon code" />
              <button onClick={applyCoupon} className="btn btn-outline">Apply</button>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <b>₹{subtotal.toLocaleString("en-IN")}</b>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <b className="text-green-700">- ₹{discount.toLocaleString("en-IN")}</b>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <b>{shipping ? "₹99" : "FREE"}</b>
              </div>
              <div className="flex justify-between">
                <span>Includes GST</span>
                <span>₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-4 text-lg">
                <b>Total</b>
                <b>₹{total.toLocaleString("en-IN")}</b>
              </div>
            </div>
            <Link href="/checkout" className="btn btn-yellow mt-6 w-full">
              Proceed to checkout <ArrowRight size={17} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
