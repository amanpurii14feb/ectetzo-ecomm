"use client";

import Link from "next/link";
import { products } from "@/data/products";
import { useStore } from "@/stores/use-store";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { useState } from "react";

const FREE_SHIPPING_AT = 999;
const COUPON = "ELECTZO10";

export default function Cart() {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const cart = useStore((s) => s.cart);
  const hydrated = useStore((s) => s.hydrated);
  const remove = useStore((s) => s.remove);
  const setQuantity = useStore((s) => s.quantity);
  const moveToWishlist = useStore((s) => s.moveToWishlist);

  const items = products.filter((product) => cart[product.id]);
  const subtotal = items.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );
  const mrpTotal = items.reduce(
    (sum, product) => sum + product.mrp * cart[product.id],
    0,
  );
  const discount =
    appliedCoupon === COUPON ? Math.min(Math.round(subtotal * 0.1), 500) : 0;
  const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : 99;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + shipping - discount;
  const productSavings = mrpTotal - subtotal;
  const totalSavings = productSavings + discount;
  const itemCount = Object.values(cart).reduce(
    (sum, quantity) => sum + quantity,
    0,
  );
  const shippingRemaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_AT) * 100);

  const applyCoupon = () => {
    const normalized = coupon.trim().toUpperCase();
    if (normalized === COUPON) {
      setAppliedCoupon(COUPON);
      setCoupon(COUPON);
      setCouponError("");
      useStore.getState().notify("Coupon applied — you saved up to ₹500");
    } else {
      setAppliedCoupon("");
      setCouponError(`Invalid code. Try ${COUPON}`);
    }
  };

  const updateQuantity = (id: number, next: number, stock: number) =>
    setQuantity(id, Math.min(stock, Math.max(1, next)));

  return (
    <div className="cart-page">
      <div className="container cart-container">
        <div className="cart-breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <span>Shopping cart</span>
        </div>
        <div className="cart-title-row">
          <div>
            <span className="eyebrow">Your selection</span>
            <h1>Your cart</h1>
            <p>
              {itemCount} {itemCount === 1 ? "item" : "items"} ready for
              checkout
            </p>
          </div>
          {items.length > 0 && (
            <Link href="/shop">
              Continue shopping <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {!hydrated ? (
          <div className="cart-loading">
            <span />
            <span />
            <span />
          </div>
        ) : !items.length ? (
          <div className="cart-empty">
            <span>
              <ShoppingBag size={32} />
            </span>
            <h2>Your cart is empty</h2>
            <p>
              Explore our trusted electrical essentials and add what you need.
            </p>
            <Link className="btn btn-yellow" href="/shop">
              Start shopping <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <div
              className={`shipping-progress ${shippingRemaining === 0 ? "complete" : ""}`}
            >
              <span>
                {shippingRemaining === 0 ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Truck size={20} />
                )}
              </span>
              <div>
                <b>
                  {shippingRemaining === 0
                    ? "You’ve unlocked free shipping"
                    : `Add ₹${shippingRemaining.toLocaleString("en-IN")} more for free shipping`}
                </b>
                <i>
                  <em style={{ width: `${shippingProgress}%` }} />
                </i>
              </div>
            </div>

            <div className="cart-layout">
              <section className="cart-items" aria-label="Cart items">
                <div className="cart-items-head">
                  <b>Products</b>
                  <span>{itemCount} items</span>
                </div>
                {items.map((product) => {
                  const quantity = cart[product.id];
                  const lineTotal = product.price * quantity;
                  const lineSaving = (product.mrp - product.price) * quantity;
                  return (
                    <article className="cart-item" key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        className="cart-item-visual product-visual"
                        style={{ background: product.color }}
                        aria-label={product.name}
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-top">
                          <div>
                            <span className="eyebrow">{product.brand}</span>
                            <Link href={`/product/${product.slug}`}>
                              {product.name}
                            </Link>
                          </div>
                          <button
                            onClick={() => remove(product.id)}
                            aria-label={`Remove ${product.name}`}
                            title="Remove item"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                        <div className="cart-stock">
                          <i /> In stock <span>· Ships in 1–2 days</span>
                        </div>
                        <div className="cart-price">
                          <b>₹{product.price.toLocaleString("en-IN")}</b>
                          <s>₹{product.mrp.toLocaleString("en-IN")}</s>
                          <span>
                            Save ₹{lineSaving.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="cart-item-actions">
                          <div
                            className="quantity-stepper"
                            aria-label={`Quantity for ${product.name}`}
                          >
                            <button
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  quantity - 1,
                                  product.stock,
                                )
                              }
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              aria-label="Quantity"
                              inputMode="numeric"
                              value={quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  product.id,
                                  Number(e.target.value) || 1,
                                  product.stock,
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                updateQuantity(
                                  product.id,
                                  quantity + 1,
                                  product.stock,
                                )
                              }
                              disabled={quantity >= product.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            className="move-wishlist"
                            onClick={() => moveToWishlist(product.id)}
                          >
                            <Heart size={15} /> Move to wishlist
                          </button>
                          <strong>₹{lineTotal.toLocaleString("en-IN")}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="cart-summary">
                <h2>Order summary</h2>
                <div className="coupon-box">
                  <label>
                    <Tag size={15} /> Have a coupon?
                  </label>
                  {appliedCoupon ? (
                    <div className="coupon-applied">
                      <span>
                        <CheckCircle2 size={17} />
                        <b>{appliedCoupon}</b> applied
                      </span>
                      <button
                        onClick={() => {
                          setAppliedCoupon("");
                          setCoupon("");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-entry">
                      <input
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder="Enter coupon code"
                      />
                      <button onClick={applyCoupon}>Apply</button>
                    </div>
                  )}
                  {couponError && <small>{couponError}</small>}
                  {!appliedCoupon && !couponError && (
                    <small>Use {COUPON} for 10% off, up to ₹500</small>
                  )}
                </div>
                <div className="summary-lines">
                  <div>
                    <span>Subtotal ({itemCount} items)</span>
                    <b>₹{subtotal.toLocaleString("en-IN")}</b>
                  </div>
                  <div>
                    <span>Product savings</span>
                    <b className="saving">
                      −₹{productSavings.toLocaleString("en-IN")}
                    </b>
                  </div>
                  {discount > 0 && (
                    <div>
                      <span>Coupon discount</span>
                      <b className="saving">
                        −₹{discount.toLocaleString("en-IN")}
                      </b>
                    </div>
                  )}
                  <div>
                    <span>Delivery</span>
                    <b className={shipping ? "" : "saving"}>
                      {shipping ? `₹${shipping}` : "FREE"}
                    </b>
                  </div>
                  <div>
                    <span>Includes GST</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="summary-total">
                  <span>
                    <b>Total</b>
                    <small>Inclusive of all taxes</small>
                  </span>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>
                <Link href="/checkout" className="btn btn-yellow cart-checkout">
                  Proceed to checkout <ArrowRight size={17} />
                </Link>
                {totalSavings > 0 && (
                  <p className="cart-savings">
                    <PackageCheck size={16} /> You save ₹
                    {totalSavings.toLocaleString("en-IN")} on this order
                  </p>
                )}
                <div className="cart-assurances">
                  <span>
                    <ShieldCheck size={16} /> Secure checkout
                  </span>
                  <span>
                    <RotateCcw size={16} /> Easy returns
                  </span>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
