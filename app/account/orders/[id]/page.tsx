import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AccountShell } from "@/components/account-shell";
import { CancelOrderButton } from "@/components/cancel-order-button";
import { MarkDeliveredButton } from "@/components/mark-delivered-button";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  ShoppingBag,
  Truck,
} from "lucide-react";
const stages = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
  money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
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
    itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <AccountShell>
      <div className="customer-order-detail">
        <Link className="customer-order-back" href="/account/orders">
          <ArrowLeft />
          Back to orders
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
          </div>
          <span
            className={`customer-status large ${order.status.toLowerCase()}`}
          >
            {order.status}
          </span>
        </header>
        {order.status !== "CANCELLED" && (
          <section className="customer-delivery-track">
            <header>
              <div>
                <span>
                  <Truck />
                </span>
                <div>
                  <small>Current status</small>
                  <b>
                    {order.status === "DELIVERED"
                      ? "Your order has been delivered"
                      : "Your order is being prepared"}
                  </b>
                </div>
              </div>
              <small>
                Last updated {order.updatedAt.toLocaleDateString("en-IN")}
              </small>
            </header>
            <div>
              {stages.map((stage, index) => (
                <span className={index <= stageIndex ? "done" : ""} key={stage}>
                  <i>{index < stageIndex ? <CheckCircle2 /> : index + 1}</i>
                  <b>{stage[0] + stage.slice(1).toLowerCase()}</b>
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
                      SKU VZ-{String(item.product.legacyId).padStart(5, "0")} ·
                      Qty {item.quantity}
                    </small>
                    {order.status === "DELIVERED" && (
                      <Link
                        className="customer-rate-link"
                        href={`/product/${item.product.slug}?review=1#reviews`}
                      >
                        Rate &amp; review
                      </Link>
                    )}
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
                  <dd>{order.paymentMethod}</dd>
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
            <section className="customer-detail-card customer-order-help">
              <header>
                <div>
                  <FileText />
                  <span>
                    <h2>Order actions</h2>
                    <p>Manage this purchase</p>
                  </span>
                </div>
              </header>
              <div>
                {["PENDING", "CONFIRMED"].includes(order.status) && (
                  <CancelOrderButton id={order.id} />
                )}{" "}
                {!["DELIVERED", "CANCELLED"].includes(order.status) && (
                  <MarkDeliveredButton id={order.id} />
                )}
                <Link href="/contact">Need help with this order?</Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AccountShell>
  );
}
