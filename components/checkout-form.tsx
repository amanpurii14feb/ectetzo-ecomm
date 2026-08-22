"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  CreditCard,
  LockKeyhole,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useProducts } from "@/lib/use-products";
import { useStore } from "@/stores/use-store";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  name: z.string().trim().min(2, "Enter your full name").max(80),
  address: z.string().trim().min(8, "Enter a complete street address").max(160),
  line2: z.string().trim().max(80).optional(),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  pin: z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
});
type Form = z.infer<typeof schema>;
type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
  isDefault: boolean;
};
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function CheckoutForm() {
  const { products, loading } = useProducts(),
    router = useRouter(),
    cart = useStore((s) => s.cart),
    hydrated = useStore((s) => s.hydrated),
    commerceReady = useStore((s) => s.commerceReady),
    clearCart = useStore((s) => s.clearCart),
    storedCoupon = useStore((s) => s.couponCode),
    setCouponCode = useStore((s) => s.setCouponCode);
  const [addresses, setAddresses] = useState<Address[]>([]),
    [selected, setSelected] = useState(""),
    [saveAddress, setSaveAddress] = useState(false),
    [terms, setTerms] = useState(false),
    [summaryOpen, setSummaryOpen] = useState(false),
    [couponOpen, setCouponOpen] = useState(false),
    [couponInput, setCouponInput] = useState(storedCoupon),
    [coupon, setCoupon] = useState(storedCoupon),
    [discount, setDiscount] = useState(0),
    [couponBusy, setCouponBusy] = useState(false),
    [couponError, setCouponError] = useState(""),
    [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      phone: "",
      name: "",
      address: "",
      line2: "",
      city: "",
      state: "",
      pin: "",
    },
  });
  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/addresses").then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, a]) => {
      const rows: Address[] = a?.addresses ?? [],
        x = rows[0];
      setAddresses(rows);
      if (x) setSelected(x.id);
      reset({
        email: p?.user?.email ?? "",
        phone: x?.phone ?? p?.user?.phone ?? "",
        name: x?.name ?? p?.user?.name ?? "",
        address: x?.line1 ?? "",
        line2: "",
        city: x?.city ?? "",
        state: x?.state ?? "",
        pin: x?.pin ?? "",
      });
    });
  }, [reset]);
  const items = useMemo(
      () => products.filter((p) => cart[p.id]),
      [products, cart],
    ),
    subtotal = items.reduce((s, p) => s + p.price * cart[p.id], 0),
    total = subtotal - discount;
  useEffect(() => {
    if (!storedCoupon || !subtotal) return;
    let active = true;
    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: storedCoupon, subtotal }),
    })
      .then(async (response) => ({
        ok: response.ok,
        body: await response.json().catch(() => ({})),
      }))
      .then(({ ok, body }) => {
        if (!active) return;
        if (ok) {
          setCoupon(body.code);
          setCouponInput(body.code);
          setDiscount(body.discount);
        } else {
          setCoupon("");
          setDiscount(0);
          setCouponCode("");
          setCouponError(body.error || "Coupon is no longer available.");
        }
      });
    return () => {
      active = false;
    };
  }, [storedCoupon, subtotal, setCouponCode]);
  function choose(a: Address) {
    setSelected(a.id);
    (
      [
        ["name", a.name],
        ["phone", a.phone],
        ["address", a.line1],
        ["city", a.city],
        ["state", a.state],
        ["pin", a.pin],
      ] as [keyof Form, string][]
    ).forEach(([k, v]) => setValue(k, v, { shouldValidate: true }));
  }
  async function applyCoupon() {
    const c = couponInput.trim().toUpperCase();
    if (!c) return setCouponError("Enter a coupon code.");
    setCouponBusy(true);
    setCouponError("");
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: c, subtotal }),
    });
    const result = await response.json().catch(() => ({}));
    setCouponBusy(false);
    if (!response.ok) {
      setCoupon("");
      setDiscount(0);
      setCouponCode("");
      return setCouponError(result.error || "Coupon could not be applied.");
    }
    setCoupon(result.code);
    setCouponInput(result.code);
    setDiscount(result.discount);
    setCouponCode(result.code);
  }
  async function submit(v: Form) {
    if (!terms || !items.length) return;
    setServerError("");
    const full = [v.address, v.line2].filter(Boolean).join(", ");
    if (saveAddress && !selected)
      await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "HOME",
          name: v.name,
          phone: v.phone,
          line1: full,
          city: v.city,
          state: v.state,
          pin: v.pin,
          isDefault: !addresses.length,
        }),
      });
    const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v.email,
          phone: v.phone,
          name: v.name,
          address: full,
          city: v.city,
          state: v.state,
          pin: v.pin,
          coupon: coupon || undefined,
          items: items.map((p) => ({ productId: p.id, quantity: cart[p.id] })),
        }),
      }),
      b = await r.json().catch(() => ({}));
    if (r.status === 401) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    if (!r.ok) {
      setServerError(
        b.error ??
          "Unable to create your order. Please review your cart and try again.",
      );
      return;
    }
    clearCart();
    router.push(
      `/order-success?order=${encodeURIComponent(b.order.orderNumber)}`,
    );
  }
  if (!hydrated || !commerceReady || loading) return <CheckoutSkeleton />;

  if (!items.length)
    return (
      <div className="container section text-center">
        <div className="card mx-auto max-w-xl p-10">
          <PackageCheck className="mx-auto text-volt" size={52} />
          <h1 className="mt-5 text-3xl font-black">Your cart is empty</h1>
          <p className="mt-2 muted">
            Add products before continuing to checkout.
          </p>
          <Link href="/shop" className="btn btn-yellow mt-6">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  const field = (
    name: keyof Form,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <label>
      <span className="label">{label}</span>
      <input
        {...props}
        className={`field ${errors[name] ? "border-red-500" : ""}`}
        aria-invalid={!!errors[name]}
        aria-describedby={`${name}-error`}
        {...register(name)}
      />
      {errors[name] && (
        <small id={`${name}-error`} role="alert" className="text-red-600">
          {errors[name]?.message}
        </small>
      )}
    </label>
  );
  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="checkout-form bg-paper py-8 md:py-12"
    >
      <div className="container max-w-[1280px]">
        <div className="mb-8 flex items-center justify-center gap-2 text-xs font-bold md:gap-4 md:text-sm">
          {["Cart", "Address", "Payment", "Review"].map((s, i) => (
            <div className="flex items-center gap-2" key={s}>
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${i <= 1 ? "bg-volt" : "bg-gray-200 text-gray-500"}`}
              >
                {i < 1 ? <Check size={15} /> : i + 1}
              </span>
              <span className={i <= 1 ? "" : "text-gray-400"}>{s}</span>
              {i < 3 && <i className="h-px w-4 bg-gray-300 md:w-12" />}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="card mb-4 flex w-full items-center justify-between p-4 text-left lg:hidden"
          onClick={() => setSummaryOpen(!summaryOpen)}
        >
          <b>Order summary · {money(total)}</b>
          <ChevronDown className={summaryOpen ? "rotate-180" : ""} />
        </button>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <section className="card rounded-2xl p-5 shadow-sm md:p-7">
              <Heading
                n="1"
                title="Contact details"
                sub="Your receipt and delivery updates go here."
              />
              <div className="grid gap-4 md:grid-cols-2">
                {field("email", "Email", {
                  type: "email",
                  autoComplete: "email",
                  maxLength: 254,
                })}
                <label>
                  <span className="label">Mobile number</span>
                  <div
                    className={`flex h-12 overflow-hidden rounded-lg border bg-white transition focus-within:border-ink focus-within:ring-2 focus-within:ring-volt/30 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                  >
                    <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-bold text-gray-600">
                      +91
                    </span>
                    <input
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 text-base text-ink outline-none"
                      aria-invalid={!!errors.phone}
                      {...register("phone", {
                        onChange: (e) => {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                        },
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <small role="alert" className="text-red-600">
                      {errors.phone.message}
                    </small>
                  )}
                </label>
              </div>
            </section>
            <section className="card rounded-2xl p-5 shadow-sm md:p-7">
              <Heading
                n="2"
                title="Shipping address"
                sub="Select a saved address or enter a new one."
              />
              {addresses.length > 0 && (
                <div className="mb-5 grid gap-3 md:grid-cols-2">
                  {addresses.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => choose(a)}
                      className={`rounded-xl border p-4 text-left ${selected === a.id ? "border-volt bg-yellow-50" : ""}`}
                    >
                      <b className="flex items-center gap-2">
                        <MapPin size={16} />
                        {a.label}
                      </b>
                      <span className="mt-2 block text-sm">
                        {a.name}
                        <br />
                        {a.line1}
                        <br />
                        {a.city}, {a.state} – {a.pin}
                        <br />
                        +91 {a.phone}
                      </span>
                      <strong className="mt-3 block text-xs">
                        {selected === a.id ? "Delivering here" : "Deliver here"}
                      </strong>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="mb-5 text-sm font-bold underline"
                onClick={() => {
                  const email = getValues("email");
                  setSelected("");
                  reset({
                    email,
                    phone: "",
                    name: "",
                    address: "",
                    line2: "",
                    city: "",
                    state: "",
                    pin: "",
                  });
                }}
              >
                + Add new address
              </button>
              <div className="grid gap-4 md:grid-cols-2">
                {field("name", "Full name", {
                  autoComplete: "name",
                  maxLength: 80,
                })}
                <div />
                {field("address", "Address line 1", {
                  autoComplete: "address-line1",
                  maxLength: 160,
                })}
                {field("line2", "Apartment / Landmark (optional)", {
                  autoComplete: "address-line2",
                  maxLength: 80,
                })}
                {field("pin", "PIN code", {
                  inputMode: "numeric",
                  autoComplete: "postal-code",
                  maxLength: 6,
                })}
                {field("city", "City", {
                  autoComplete: "address-level2",
                  maxLength: 80,
                })}
                {field("state", "State", {
                  autoComplete: "address-level1",
                  maxLength: 80,
                })}
                <label>
                  <span className="label">Country</span>
                  <input className="field bg-gray-50" value="India" disabled />
                </label>
              </div>
              {!selected && (
                <label className="mt-5 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                  />{" "}
                  Save this address for future orders
                </label>
              )}
            </section>
            <section className="card rounded-2xl p-5 shadow-sm md:p-7">
              <Heading n="3" title="Delivery method" />
              <Option
                icon={<Truck />}
                title="Standard delivery"
                sub="3–6 business days"
                price="FREE"
              />
              <Option
                disabled
                icon={<Truck />}
                title="Express delivery"
                sub="Coming soon"
                price="₹99"
              />
            </section>
            <section className="card rounded-2xl p-5 shadow-sm md:p-7">
              <Heading n="4" title="Payment" />
              <Option
                icon={<PackageCheck />}
                title="Cash on Delivery"
                sub="Pay when your order arrives"
                price="₹0"
              />
              <Option
                disabled
                icon={<CreditCard />}
                title="UPI, cards and net banking"
                sub="Online payments coming soon"
              />
            </section>
          </div>
          <aside
            className={`${summaryOpen ? "block" : "hidden"} card rounded-2xl p-5 shadow-sm lg:sticky lg:top-28 lg:block md:p-6`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black">Order summary</h2>
              <Link href="/cart" className="text-sm font-bold underline">
                Edit cart
              </Link>
            </div>
            <div className="my-5 max-h-[330px] space-y-4 overflow-auto">
              {items.map((p) => (
                <div className="flex gap-3" key={p.id}>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {p.images?.[0] && (
                      <Image
                        src={p.images[0]}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-contain"
                        unoptimized
                      />
                    )}
                    <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-white">
                      {cart[p.id]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <b className="line-clamp-2 text-sm">{p.name}</b>
                    <small className="block muted">
                      {p.brand} · Qty {cart[p.id]}
                    </small>
                    <strong className="text-sm">
                      {money(p.price * cart[p.id])}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-y py-4">
              <button
                type="button"
                className="flex w-full justify-between text-sm font-bold"
                onClick={() => setCouponOpen(!couponOpen)}
              >
                Have a coupon?
                <ChevronDown size={17} />
              </button>
              {couponOpen && (
                <div className="mt-3">
                  <div className="flex">
                    <input
                      value={couponInput}
                      onChange={(e) =>
                        setCouponInput(
                          e.target.value.toUpperCase().slice(0, 20),
                        )
                      }
                      className="field rounded-r-none"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponBusy}
                      className="btn btn-dark rounded-l-none"
                    >
                      {couponBusy ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  {coupon && (
                    <p className="mt-2 text-sm font-bold text-green-700">
                      {coupon} applied — saved {money(discount)}{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          setCoupon("");
                          setDiscount(0);
                          setCouponCode("");
                        }}
                      >
                        Remove
                      </button>
                    </p>
                  )}
                  {couponError && (
                    <p role="alert" className="mt-2 text-sm text-red-600">
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>
            <dl className="space-y-3 py-5 text-sm">
              <Row label="Subtotal" value={money(subtotal)} />
              <Row label="Shipping" value="FREE" />
              <Row label="Discount" value={`-${money(discount)}`} />
              <Row label="GST / Taxes" value="Included" />
              <div className="flex justify-between border-t pt-4 text-xl font-black">
                <dt>Total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <label className="flex items-start gap-3 text-xs">
              <input
                className="mt-1"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <span>
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="font-bold underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-bold underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {serverError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {serverError}
              </p>
            )}
            <button
              disabled={!items.length || !terms || !isValid || isSubmitting}
              className="btn btn-yellow mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Placing your order..."
                : `Place Order • ${money(total)}`}
            </button>
            <div className="mt-5 grid grid-cols-2 gap-3 text-[11px] font-bold text-gray-600">
              <span className="flex items-center gap-1">
                <LockKeyhole size={14} /> Secure checkout
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} /> Genuine products
              </span>
              <span className="flex items-center gap-1">
                <Truck size={14} /> Reliable delivery
              </span>
              <span className="flex items-center gap-1">
                <PackageCheck size={14} /> Easy returns
              </span>
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
}
function Heading({
  n,
  title,
  sub,
}: {
  n: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-volt font-black">
        {n}
      </span>
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        {sub && <p className="text-sm muted">{sub}</p>}
      </div>
    </div>
  );
}
function Option({
  icon,
  title,
  sub,
  price,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  price?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`mt-3 flex items-center gap-4 rounded-xl border-2 p-4 ${disabled ? "opacity-50" : "border-volt bg-yellow-50"}`}
    >
      <input
        type="radio"
        checked={!disabled}
        disabled={disabled}
        readOnly
        name={title.includes("delivery") ? "delivery" : "payment"}
      />
      {icon}
      <span className="flex-1">
        <b className="block">{title}</b>
        <small className="muted">{sub}</small>
      </span>
      {price && <b>{price}</b>}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div
      className="checkout-form bg-paper py-8 md:py-12"
      role="status"
      aria-label="Loading checkout"
    >
      <div className="container max-w-[1280px] animate-pulse">
        <div className="mx-auto mb-8 h-8 w-80 max-w-full rounded-full bg-gray-200" />
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <div className="card h-52 rounded-2xl bg-white" />
            <div className="card h-[430px] rounded-2xl bg-white" />
            <div className="card h-44 rounded-2xl bg-white" />
          </div>
          <div className="card h-[520px] rounded-2xl bg-white" />
        </div>
      </div>
      <span className="sr-only">Loading your cart and checkout details…</span>
    </div>
  );
}
