import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Heart, MapPin, Package, ShieldCheck, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { AccountProducts } from "@/components/account-products";
import { AccountShell } from "@/components/account-shell";
import { AccountStatCard } from "@/components/account-stat-card";
import { prisma } from "@/lib/prisma";
import { getStoreProducts } from "@/lib/store-products";

const statusColors: Record<string, string> = { DELIVERED: "#23834b", SHIPPED: "#3976c5", PROCESSING: "#7558bd", CONFIRMED: "#247da5", PENDING: "#d49b00", CANCELLED: "#c44a4a" };
const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const [orders, addresses, user, products] = userId ? await Promise.all([
    prisma.order.findMany({ where: { userId }, include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.address.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true } }),
    getStoreProducts(),
  ]) : [[], 0, null, await getStoreProducts()];

  const activeOrders = orders.filter((order) => order.status !== "CANCELLED");
  const totalSpent = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const totalSaved = activeOrders.reduce((sum, order) => sum + order.discount, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = activeOrders.filter((order) => order.createdAt >= monthStart);
  const thisMonthSpent = thisMonth.reduce((sum, order) => sum + order.total, 0);
  const months = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const matching = activeOrders.filter((order) => order.createdAt >= start && order.createdAt < end);
    return { label: start.toLocaleDateString("en-IN", { month: "short" }), spent: matching.reduce((sum, order) => sum + order.total, 0), orders: matching.length };
  });
  const maxSpend = Math.max(...months.map((month) => month.spent), 1);
  const maxOrders = Math.max(...months.map((month) => month.orders), 1);
  const chartPoints = months.map((month, index) => `${index * 20},${94 - (month.spent / maxSpend) * 76}`).join(" ");

  const statuses = Object.entries(orders.reduce<Record<string, number>>((result, order) => {
    result[order.status] = (result[order.status] ?? 0) + 1;
    return result;
  }, {})).sort((a, b) => b[1] - a[1]);
  let cursor = 0;
  const statusGradient = statuses.length ? `conic-gradient(${statuses.map(([status, count]) => {
    const start = cursor;
    cursor += (count / orders.length) * 100;
    return `${statusColors[status] ?? "#87918a"} ${start}% ${cursor}%`;
  }).join(",")})` : "conic-gradient(#e7ebe8 0 100%)";

  const categoryMap = new Map<string, number>();
  activeOrders.forEach((order) => order.items.forEach((item) => categoryMap.set(item.product.category || "Other", (categoryMap.get(item.product.category || "Other") ?? 0) + item.price * item.quantity)));
  const categories = [...categoryMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategory = Math.max(...categories.map(([, value]) => value), 1);
  const setupItems = [Boolean(user?.name), Boolean(user?.phone), addresses > 0];
  const setupPercent = Math.round((setupItems.filter(Boolean).length / setupItems.length) * 100);
  const firstName = (user?.name ?? session?.user?.name ?? "Customer").split(" ")[0];

  return <AccountShell><section className="account-dashboard-v2" aria-labelledby="account-overview-title">
    <header className="account-dashboard-hero"><div><span className="eyebrow">Account overview</span><h1 id="account-overview-title">Welcome back, {firstName}</h1><p>Orders, savings and account activity—organized in one clear view.</p></div><Link className="btn btn-yellow" href="/shop">Continue shopping <ArrowRight size={16}/></Link></header>

    <div className="account-stat-grid account-kpis-v2"><AccountStatCard type="orders" value={orders.length} detail={`${thisMonth.length} this month`}/><AccountStatCard type="spent" value={totalSpent} detail={`${money(thisMonthSpent)} this month`}/><AccountStatCard type="addresses" value={addresses} detail={addresses ? "Ready for delivery" : "Add a delivery address"}/><AccountStatCard type="wishlist" detail="Saved for later"/></div>

    <div className="account-insights-grid">
      <section className="account-chart-card spending-card"><header><div><span>Spending overview</span><h2>{money(totalSpent)}</h2></div><small>Last 6 months</small></header><div className="account-area-chart" aria-label="Spending over the last six months"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eab900" stopOpacity=".28"/><stop offset="1" stopColor="#eab900" stopOpacity="0"/></linearGradient></defs><polyline className="area-fill" points={`0,100 ${chartPoints} 100,100`}/><polyline className="area-line" points={chartPoints}/></svg><div>{months.map((month) => <span key={month.label}>{month.label}</span>)}</div></div></section>
      <section className="account-chart-card status-card"><header><div><span>Order status</span><h2>Order mix</h2></div><small>{orders.length} total</small></header><div className="status-chart-body"><div className="status-donut" style={{ background: statusGradient }}><span><b>{orders.length}</b><small>orders</small></span></div><div className="status-legend">{statuses.length ? statuses.map(([status, count]) => <div key={status}><i style={{ background: statusColors[status] ?? "#87918a" }}/><span>{status.toLowerCase()}</span><b>{count}</b></div>) : <p>No order activity yet.</p>}</div></div></section>
      <section className="account-chart-card category-card"><header><div><span>Where you spend</span><h2>Top categories</h2></div><small>By order value</small></header><div className="category-spend-list">{categories.length ? categories.map(([category, value]) => <div key={category}><span><b>{category}</b><small>{money(value)}</small></span><i><em style={{ width: `${(value / maxCategory) * 100}%` }}/></i></div>) : <p>No category data yet. Your purchases will build this view.</p>}</div></section>
      <section className="account-chart-card monthly-card"><header><div><span>Order frequency</span><h2>Monthly orders</h2></div><small>Last 6 months</small></header><div className="monthly-order-bars">{months.map((month) => <div key={month.label}><i style={{ height: `${Math.max((month.orders / maxOrders) * 100, 5)}%` }}><small>{month.orders}</small></i><span>{month.label}</span></div>)}</div></section>
    </div>

    <div className="account-dashboard-main-grid"><section className="account-recent-card"><header><div><span className="eyebrow">Purchase history</span><h2>Recent orders</h2></div><Link href="/account/orders">View all orders <ArrowRight size={14}/></Link></header>{orders.length ? orders.slice(0, 4).map((order) => { const item = order.items[0]; return <Link className="account-recent-row" href={`/account/orders/${order.orderNumber}`} key={order.id}><span className="account-recent-thumb" style={{ background: item?.product.color ?? "#f1f3f2" }}>{item?.product.images[0] ? <img src={item.product.images[0]} alt=""/> : <Package size={20}/>}</span><span><b>#{order.orderNumber}</b><small>{item?.name ?? "Electzo order"}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}</small></span><span><b>{order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</b><small>{order.items.reduce((sum, current) => sum + current.quantity, 0)} items</small></span><strong>{money(order.total)}</strong><span className={`customer-status ${order.status.toLowerCase()}`}>{order.status}</span><ChevronRight size={16}/></Link>; }) : <div className="account-dashboard-empty"><ShoppingBag/><h3>Your first order starts here</h3><p>Explore reliable electrical essentials for every project.</p><Link className="btn btn-yellow" href="/shop">Browse products</Link></div>}</section>
      <aside className="account-dashboard-side"><section className="account-quick-card"><header><span>Shortcuts</span><h2>Quick actions</h2></header><div><Link href="/account/orders"><Package/><span><b>Track orders</b><small>See live order status</small></span><ChevronRight/></Link><Link href="/account/profile"><UserRound/><span><b>Edit profile</b><small>Update personal details</small></span><ChevronRight/></Link><Link href="/account/addresses"><MapPin/><span><b>Manage addresses</b><small>Delivery destinations</small></span><ChevronRight/></Link><Link href="/wishlist"><Heart/><span><b>Open wishlist</b><small>Products saved for later</small></span><ChevronRight/></Link></div></section><section className="account-setup-card"><header><span><ShieldCheck/> Account setup</span><b>{setupPercent}%</b></header><i><em style={{ width: `${setupPercent}%` }}/></i><p>{setupPercent === 100 ? "Your core account details are complete." : "Complete your details for a smoother checkout."}</p><ul><li className={setupItems[0] ? "done" : ""}><CheckCircle2/> Profile name</li><li className={setupItems[1] ? "done" : ""}><CheckCircle2/> Mobile number</li><li className={setupItems[2] ? "done" : ""}><CheckCircle2/> Delivery address</li></ul>{setupPercent < 100 && <Link href="/account/profile">Complete account <ArrowRight/></Link>}</section>{totalSaved > 0 && <section className="account-savings-card"><Sparkles/><div><span>Total coupon savings</span><b>{money(totalSaved)}</b></div></section>}</aside>
    </div>
    <AccountProducts products={products.slice(0, 5)}/>
  </section></AccountShell>;
}
