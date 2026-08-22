import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/account-shell";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  PackageSearch,
  ShoppingBag,
} from "lucide-react";
const filters = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth(),
    query = await searchParams,
    status = filters.includes(query.status?.toUpperCase() ?? "")
      ? query.status!.toUpperCase()
      : "ALL",
    orders = session?.user?.id
      ? await prisma.order.findMany({
          where: {
            userId: session.user.id,
            ...(status !== "ALL" ? { status: status as "PENDING" } : {}),
          },
          include: {
            items: {
              include: {
                product: { select: { slug: true, images: true, color: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
    allOrders = session?.user?.id
      ? await prisma.order.findMany({
          where: { userId: session.user.id },
          select: { status: true, total: true },
        })
      : [],
    active = allOrders.filter(
      (order) => !["DELIVERED", "CANCELLED"].includes(order.status),
    ).length,
    delivered = allOrders.filter(
      (order) => order.status === "DELIVERED",
    ).length,
    totalSpent = allOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.total, 0);
  return (
    <AccountShell>
      <div className="customer-orders">
        <header className="customer-orders-hero">
          <div>
            <span className="eyebrow">Purchase history</span>
            <h1>My orders</h1>
            <p>
              Track deliveries, review purchases, and manage every order in one
              place.
            </p>
          </div>
          <Link href="/shop" className="btn btn-dark">
            Continue shopping <ArrowRight />
          </Link>
        </header>
        <section className="customer-order-metrics">
          <article>
            <span>
              <ShoppingBag />
            </span>
            <div>
              <small>Total orders</small>
              <b>{allOrders.length}</b>
            </div>
          </article>
          <article>
            <span>
              <Clock3 />
            </span>
            <div>
              <small>Active orders</small>
              <b>{active}</b>
            </div>
          </article>
          <article>
            <span>
              <CheckCircle2 />
            </span>
            <div>
              <small>Delivered</small>
              <b>{delivered}</b>
            </div>
          </article>
          <article>
            <span>
              <IndianRupee />
            </span>
            <div>
              <small>Total spent</small>
              <b>₹{totalSpent.toLocaleString("en-IN")}</b>
            </div>
          </article>
        </section>
        <nav className="customer-order-filters" aria-label="Filter orders">
          {filters.map((filter) => (
            <Link
              className={status === filter ? "active" : ""}
              href={
                filter === "ALL"
                  ? "/account/orders"
                  : `/account/orders?status=${filter}`
              }
              key={filter}
            >
              {filter[0] + filter.slice(1).toLowerCase()}
            </Link>
          ))}
        </nav>
        <section className="customer-order-list">
          {orders.length ? (
            orders.map((order) => (
              <article className="customer-order-row" key={order.id}>
                <div className="customer-order-row-head">
                  <div>
                    <span>Order #{order.orderNumber}</span>
                    <small>
                      <CalendarDays />{" "}
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                  <span
                    className={`customer-status ${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="customer-order-row-body">
                  <div className="customer-order-thumbs">
                    {order.items.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        style={{ background: item.product.color ?? "#f1f2f1" }}
                      >
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt=""
                            width={42}
                            height={42}
                            unoptimized
                          />
                        ) : (
                          "E"
                        )}
                      </span>
                    ))}
                    {order.items.length > 3 && <i>+{order.items.length - 3}</i>}
                  </div>
                  <div className="customer-order-copy">
                    <b>
                      {order.items[0]?.name}
                      {order.items.length > 1 &&
                        ` + ${order.items.length - 1} more`}
                    </b>
                    <small>
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      items · {order.paymentMethod}
                    </small>
                  </div>
                  <div className="customer-order-total">
                    <small>Order total</small>
                    <b>₹{order.total.toLocaleString("en-IN")}</b>
                  </div>
                  <div className="customer-order-actions">
                    <Link
                      href={`/account/orders/${order.orderNumber}`}
                      className="btn btn-outline"
                    >
                      View details <ArrowRight />
                    </Link>
                    {order.status === "DELIVERED" && order.items[0] && (
                      <Link
                        href={`/product/${order.items[0].product.slug}?review=1#reviews`}
                      >
                        Rate &amp; review
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="customer-orders-empty">
              <span>
                <PackageSearch />
              </span>
              <h2>
                No {status === "ALL" ? "" : status.toLowerCase()} orders found
              </h2>
              <p>
                {status === "ALL"
                  ? "Your orders will appear here after your first purchase."
                  : "Try another status filter to find your order."}
              </p>
              <Link
                href={status === "ALL" ? "/shop" : "/account/orders"}
                className="btn btn-dark"
              >
                {status === "ALL" ? "Start shopping" : "View all orders"}
              </Link>
            </div>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
