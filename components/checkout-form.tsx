"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { useStore } from "@/stores/use-store";
const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  name: z.string().min(2),
  address: z.string().min(8),
  city: z.string().min(2),
  state: z.string().min(2),
  pin: z.string().length(6),
});
type Form = z.infer<typeof schema>;
export function CheckoutForm() {
  const { products } = useProducts();
  const r = useRouter(),
    cart = useStore((s) => s.cart),
    clearCart = useStore((s) => s.clearCart);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const items = products.filter((p) => cart[p.id]),
    total = items.reduce((a, p) => a + p.price * cart[p.id], 0);
  async function placeOrder(values: Form) {
    setServerError("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        items: items.map((product) => ({
          productId: product.id,
          quantity: cart[product.id],
        })),
      }),
    });
    const body = await response.json();
    if (response.status === 401) {
      r.push("/login");
      return;
    }
    if (!response.ok) {
      setServerError(body.error ?? "Order could not be placed.");
      return;
    }
    clearCart();
    r.push(`/order-success?order=${body.order.orderNumber}`);
  }
  return (
    <form onSubmit={handleSubmit(placeOrder)} className="container section">
      <h1 className="section-title">Secure checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-xl font-black">1. Contact details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="label">Email</span>
                <input className="field" {...register("email")} />
                <small className="text-red-600">{errors.email?.message}</small>
              </label>
              <label>
                <span className="label">Mobile</span>
                <input className="field" {...register("phone")} />
              </label>
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-black">2. Shipping address</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label>
                <span className="label">Full name</span>
                <input className="field" {...register("name")} />
              </label>
              <label className="md:col-span-2">
                <span className="label">Address</span>
                <input className="field" {...register("address")} />
              </label>
              <label>
                <span className="label">City</span>
                <input className="field" {...register("city")} />
              </label>
              <label>
                <span className="label">State</span>
                <input className="field" {...register("state")} />
              </label>
              <label>
                <span className="label">PIN code</span>
                <input className="field" {...register("pin")} />
              </label>
            </div>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-black">3. Delivery method</h2>
            <label className="mt-4 flex justify-between rounded border border-volt p-4">
              <span>
                <b>Standard delivery</b>
                <small className="block muted">3–6 business days</small>
              </span>
              <b>FREE</b>
            </label>
          </section>
          <section className="card p-6">
            <h2 className="text-xl font-black">4. Payment</h2>
            <p className="mt-1 text-sm muted">
              Online payment will be added later. This order will use Cash on
              Delivery.
            </p>
            <div className="mt-5 rounded border border-volt p-4 font-bold">
              Cash on Delivery
            </div>
          </section>
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-4">
          <h2 className="text-xl font-black">Order summary</h2>
          <div className="my-5 space-y-4">
            {items.map((p) => (
              <div className="flex justify-between gap-3 text-sm" key={p.id}>
                <span>
                  {p.name} × {cart[p.id]}
                </span>
                <b>₹{(p.price * cart[p.id]).toLocaleString("en-IN")}</b>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-4 text-xl">
            <b>Total</b>
            <b>₹{total.toLocaleString("en-IN")}</b>
          </div>
          {serverError && (
            <p className="mt-4 text-sm text-red-600">{serverError}</p>
          )}
          <button
            disabled={!items.length}
            className="btn btn-yellow mt-6 w-full"
          >
            Place order
          </button>
        </aside>
      </div>
    </form>
  );
}
