import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { MarkDeliveredButton } from "@/components/mark-delivered-button";
import { OrderProductActions } from "@/components/order-product-actions";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
const stages = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "OUT FOR DELIVERY",
    "DELIVERED",
  ],
  money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const statusContent: Record<string, { title: string; description: string }> = {
  PENDING: { title: "Your order is awaiting confirmation", description: "We received your order and are confirming the details." },
  CONFIRMED: { title: "Your order has been confirmed", description: "Your items are confirmed and will move to processing shortly." },
  PROCESSING: { title: "Your order is being prepared", description: "We're carefully preparing your items for dispatch." },
  SHIPPED: { title: "Your order is on the way", description: "Your items have left our facility and are moving toward you." },
  DELIVERED: { title: "Your order has been delivered", description: "Delivered successfully. Thank you for shopping with Electzo." },
};
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    session = await auth(),
    order = await prisma.order.findFirst({
      where: { userId: session!.user!.id!, OR: [{ id }, { orderNumber: id }] },
      include: { items: { include: { product: true } } },
    });
  if (!order) notFound();
  const stageIndex = stages.indexOf(order.status),
    itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0),
    progress = stageIndex < 0 ? 0 : (stageIndex / (stages.length - 1)) * 100,
    currentStatus = statusContent[order.status] ?? statusContent.PENDING;
  return (
    <div className="customer-order-detail-page">
      <div className="customer-order-detail">
        <nav className="order-breadcrumb" aria-label="Breadcrumb">
          <Link href="/account">My Account</Link>
          <ChevronRight />
          <Link href="/account/orders">Orders</Link>
          <ChevronRight />
          <span>#{order.orderNumber}</span>
        </nav>
        <Link className="customer-order-back" href="/account/orders">
          <ArrowLeft />
          Back to My Orders
        </Link>
        <header className="customer-order-detail-hero">
          <div>
            <span className="eyebrow">Order #{order.orderNumber}</span>
            <h1>Order details</h1>
            <p>
              <CalendarDays /> Placed{" "}
              {order.createdAt.toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
            <small>
              {order.items.length}{" "}
              {order.items.length === 1 ? "product" : "products"} · {itemCount}{" "}
              units
            </small>
          </div>
          <span
            className={`customer-status large ${order.status.toLowerCase()}`}
          >
            {order.status}
          </span>
        </header>
        <section className="order-info-strip">
          <div>
            <ShoppingBag />
            <span>
              <small>Order ID</small>
              <b>#{order.orderNumber}</b>
            </span>
          </div>
          <div>
            <ShoppingBag />
            <span>
              <small>Items</small>
              <b>{itemCount} units</b>
            </span>
          </div>
          <div>
            <CreditCard />
            <span>
              <small>Payment</small>
              <b>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </b>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              <small>Protection</small>
              <b>Secure order</b>
            </span>
          </div>
        </section>
        {order.status !== "CANCELLED" && (
          <section className="customer-delivery-track">
            <header>
              <div>
                <span>
                  <Truck />
                </span>
                <div>
                  <small>Current status</small>
                  <b>{currentStatus.title}</b>
                  <p>{currentStatus.description}</p>
                </div>
              </div>
              <small>
                Last updated {order.updatedAt.toLocaleDateString("en-IN")}
              </small>
            </header>
            <div
              className="order-progress-steps"
              style={{ "--order-progress": progress / 100 } as CSSProperties}
            >
              {stages.map((stage, index) => (
                <span
                  className={index < stageIndex ? "completed" : index === stageIndex ? "current" : "upcoming"}
                  key={stage}
                  aria-current={index === stageIndex ? "step" : undefined}
                >
                  <i>{index < stageIndex ? <CheckCircle2 /> : index + 1}</i>
                  <b>{stage === "OUT FOR DELIVERY" ? "Out for delivery" : stage[0] + stage.slice(1).toLowerCase()}</b>
                </span>
              ))}
            </div>
          </section>
        )}
        <div className="customer-order-detail-grid">
          <main>
            <section className="customer-detail-card customer-items-card">
              <header>
                <div>
                  <ShoppingBag />
                  <span>
                    <h2>Items in your order</h2>
                    <p>{itemCount} items</p>
                  </span>
                </div>
              </header>
              {order.items.map((item) => (
                <article key={item.id}>
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="customer-detail-product-image"
                    style={{ background: item.product.color ?? "#f1f2f1" }}
                  >
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt={item.name}
                        fill
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      "E"
                    )}
                  </Link>
                  <div>
                    <Link href={`/product/${item.product.slug}`}>
                      {item.name}
                    </Link>
                    <small>
                      SKU VZ-{String(item.product.legacyId).padStart(5, "0")}
                    </small>
                    <small>
                      {item.product.brand} · Qty {item.quantity} ·{" "}
                      {item.product.category}
                    </small>
                    <OrderProductActions
                      id={item.product.legacyId}
                      slug={item.product.slug}
                      review={order.status === "DELIVERED"}
                    />
                  </div>
                  <span>
                    <small>{money(item.price)} each</small>
                    <b>{money(item.price * item.quantity)}</b>
                  </span>
                </article>
              ))}
              <div className="customer-detail-summary">
                <p>
                  <span>Subtotal</span>
                  <b>{money(order.subtotal)}</b>
                </p>
                {order.discount > 0 && (
                  <p className="discount">
                    <span>
                      Coupon discount{" "}
                      {order.couponCode && <em>{order.couponCode}</em>}
                    </span>
                    <b>−{money(order.discount)}</b>
                  </p>
                )}
                <p>
                  <span>Shipping</span>
                  <b>{order.shipping ? money(order.shipping) : "Free"}</b>
                </p>
                <p className="total">
                  <span>Total paid</span>
                  <b>{money(order.total)}</b>
                </p>
              </div>
              <div className="order-trust-strip">
                <span>
                  <ShieldCheck />
                  Secure order
                </span>
                <span>
                  <Headphones />
                  Easy support
                </span>
                <span>
                  <CheckCircle2 />
                  Authentic products
                </span>
              </div>
            </section>
            <section className="customer-inline-actions">
              <div>
                <b>Need to manage this order?</b>
                <p>
                  Update the delivery state, cancel an eligible order, or
                  contact support.
                </p>
                <a href={`tel:${order.contactPhone}`}>
                  <Phone /> {order.contactPhone}
                </a>
              </div>
              <div>
                {["PENDING", "CONFIRMED"].includes(order.status) && (
                  <CancelOrderButton id={order.id} />
                )}
                {/* {!["DELIVERED", "CANCELLED"].includes(order.status) && (
                  <MarkDeliveredButton id={order.id} />
                )} */}
                <Link href="/contact" className="btn btn-outline">
                  Contact support
                </Link>
              </div>
            </section>
          </main>
          <aside>
            <section className="customer-detail-card">
              <header>
                <div>
                  <MapPin />
                  <span>
                    <h2>Delivery address</h2>
                    <p>Shipping destination</p>
                  </span>
                </div>
              </header>
              <div className="customer-address">
                <b>{order.shippingName}</b>
                <p>
                  {order.addressLine1}
                  <br />
                  {order.city}, {order.state} {order.pin}
                </p>
              </div>
            </section>
            <section className="customer-detail-card">
              <header>
                <div>
                  <CreditCard />
                  <span>
                    <h2>Payment details</h2>
                    <p>Transaction summary</p>
                  </span>
                </div>
              </header>
              <dl>
                <div>
                  <dt>Method</dt>
                  <dd>
                    {order.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : order.paymentMethod}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span
                      className={`customer-payment ${order.paymentStatus.toLowerCase()}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd>{money(order.total)}</dd>
                </div>
              </dl>
            </section>
            <section className="customer-detail-card order-support-card">
              <div>
                <span>
                  <Headphones />
                </span>
                <h2>Need help with this order?</h2>
                <p>
                  Our support team can help with delivery, payment or
                  product-related questions.
                </p>
                <Link href="/contact" className="btn btn-outline">
                  Contact support
                </Link>
                <small>We usually respond within a few minutes.</small>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
