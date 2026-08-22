import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/admin/components/ui";
import { OrderStatus } from "@/admin/components/order-status";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Printer,
  RotateCcw,
  ShoppingBag,
  Truck,
  UserRound,
  XCircle,
} from "lucide-react";
export const dynamic = "force-dynamic";
const stages = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
  money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    o = await prisma.order.findUnique({
      where: { id },
      include: { user: true, items: { include: { product: true } } },
    });
  if (!o) notFound();
  const itemCount = o.items.reduce((sum, item) => sum + item.quantity, 0),
    stageIndex = stages.indexOf(o.status),
    customer = o.user.name ?? o.shippingName;
  return (
    <>
      <PageHeader
        title={`Order ${o.orderNumber}`}
        description={`Placed ${o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}
        actions={
          <>
            <button className="adm-btn">
              <Printer />
              Print
            </button>
            <button className="adm-btn">
              <RotateCcw />
              Refund
            </button>
            {o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
              <button className="adm-btn danger">
                <XCircle />
                Cancel
              </button>
            )}
          </>
        }
      />
      <section className="adm-order-overview">
        <article>
          <span>
            <ShoppingBag />
          </span>
          <div>
            <small>Order status</small>
            <StatusBadge
              tone={
                o.status === "DELIVERED"
                  ? "success"
                  : o.status === "CANCELLED"
                    ? "danger"
                    : "info"
              }
            >
              {o.status}
            </StatusBadge>
          </div>
        </article>
        <article>
          <span>
            <IndianRupee />
          </span>
          <div>
            <small>Order total</small>
            <b>{money(o.total)}</b>
          </div>
        </article>
        <article>
          <span>
            <CreditCard />
          </span>
          <div>
            <small>Payment</small>
            <b>
              {o.paymentMethod} · {o.paymentStatus}
            </b>
          </div>
        </article>
        <article>
          <span>
            <PackageCheck />
          </span>
          <div>
            <small>Products</small>
            <b>
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </b>
          </div>
        </article>
      </section>
      <div className="adm-order-layout premium">
        <main>
          <section className="adm-panel adm-order-card premium">
            <header>
              <div>
                <h2>Order items</h2>
                <p>
                  {itemCount} units across {o.items.length} products
                </p>
              </div>
              <StatusBadge tone="info">{o.items.length} products</StatusBadge>
            </header>
            <div className="adm-order-items-head">
              <span>Product</span>
              <span>Unit price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {o.items.map((item) => (
              <div className="adm-order-item premium" key={item.id}>
                <Link
                  className="adm-order-product"
                  href={`/admin/products/${item.product.id}/edit`}
                >
                  <span style={{ background: item.product.color ?? "#f2f3f2" }}>
                    {item.product.images[0] ? (
                      <Image
                        src={item.product.images[0]}
                        alt=""
                        fill
                        sizes="52px"
                        unoptimized
                      />
                    ) : (
                      "E"
                    )}
                  </span>
                  <p>
                    <b>{item.name}</b>
                    <small>
                      SKU VZ-{String(item.product.legacyId).padStart(5, "0")}
                    </small>
                  </p>
                </Link>
                <span>{money(item.price)}</span>
                <span className="adm-order-qty">× {item.quantity}</span>
                <b>{money(item.price * item.quantity)}</b>
              </div>
            ))}
            <div className="adm-summary premium">
              <p>
                <span>Subtotal</span>
                <b>{money(o.subtotal)}</b>
              </p>
              {o.discount > 0 && (
                <p className="discount">
                  <span>Coupon {o.couponCode && <em>{o.couponCode}</em>}</span>
                  <b>−{money(o.discount)}</b>
                </p>
              )}
              <p>
                <span>Shipping</span>
                <b>{o.shipping ? money(o.shipping) : "Free"}</b>
              </p>
              <p className="total">
                <span>
                  <b>Total</b>
                  <small>Inclusive of taxes</small>
                </span>
                <b>{money(o.total)}</b>
              </p>
            </div>
          </section>
          <section className="adm-panel adm-order-card premium">
            <header>
              <div>
                <h2>Order activity</h2>
                <p>Fulfillment and payment progress</p>
              </div>
              <Clock3 />
            </header>
            <div className="adm-timeline premium">
              {[
                <>
                  <b>Order placed</b>
                  <small>{o.createdAt.toLocaleString("en-IN")}</small>
                </>,
                <>
                  <b>Payment {o.paymentStatus.toLowerCase()}</b>
                  <small>{o.paymentMethod} payment selected</small>
                </>,
                <>
                  <b>Fulfillment: {o.status.toLowerCase()}</b>
                  <small>
                    Last updated {o.updatedAt.toLocaleString("en-IN")}
                  </small>
                </>,
              ].map((content, index) => (
                <div className="done" key={index}>
                  <i>
                    <CheckCircle2 />
                  </i>
                  <p>{content}</p>
                </div>
              ))}
            </div>
            <div className="adm-note-wrap">
              <label>
                Internal note <small>Only staff can see this</small>
              </label>
              <textarea
                className="adm-note"
                placeholder="Add context for your team about this order..."
              />
              <button className="adm-btn">Save note</button>
            </div>
          </section>
        </main>
        <aside>
          <section className="adm-panel adm-order-card premium fulfillment-card">
            <header>
              <div>
                <h2>Fulfillment</h2>
                <p>Update delivery progress</p>
              </div>
              <Truck />
            </header>
            <div className="adm-fulfillment-current">
              <span>
                <PackageCheck />
              </span>
              <div>
                <small>Current status</small>
                <b>{o.status}</b>
              </div>
            </div>
            <OrderStatus id={o.id} status={o.status} />
            {o.status !== "CANCELLED" && (
              <div className="adm-stage-track">
                {stages.map((stage, index) => (
                  <div
                    className={index <= stageIndex ? "done" : ""}
                    key={stage}
                  >
                    <i>{index < stageIndex ? <CheckCircle2 /> : index + 1}</i>
                    <span>{stage.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="adm-panel adm-order-card premium customer-card">
            <header>
              <div>
                <h2>Customer</h2>
                <p>Contact and delivery details</p>
              </div>
              <UserRound />
            </header>
            <div className="adm-customer-name">
              <span>
                {customer
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </span>
              <div>
                <b>{customer}</b>
                <small>Customer account</small>
              </div>
            </div>
            <div className="adm-contact-list">
              <a href={`mailto:${o.contactEmail}`}>
                <Mail />
                <span>
                  <small>Email</small>
                  {o.contactEmail}
                </span>
              </a>
              <a href={`tel:${o.contactPhone}`}>
                <Phone />
                <span>
                  <small>Phone</small>
                  {o.contactPhone}
                </span>
              </a>
            </div>
            <div className="adm-shipping-block">
              <h3>
                <MapPin />
                Shipping address
              </h3>
              <b>{o.shippingName}</b>
              <p>
                {o.addressLine1}
                <br />
                {o.city}, {o.state}
                <br />
                <strong>{o.pin}</strong>
              </p>
            </div>
          </section>
          <section className="adm-panel adm-order-card premium order-meta-card">
            <header>
              <h2>Order details</h2>
              <CalendarDays />
            </header>
            <dl>
              <div>
                <dt>Order ID</dt>
                <dd>{o.orderNumber}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{o.createdAt.toLocaleDateString("en-IN")}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{o.updatedAt.toLocaleDateString("en-IN")}</dd>
              </div>
              {o.couponCode && (
                <div>
                  <dt>Coupon</dt>
                  <dd>{o.couponCode}</dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}
