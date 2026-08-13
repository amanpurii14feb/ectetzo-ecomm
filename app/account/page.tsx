import { AccountShell } from "@/components/account-shell";
import { AccountStatCard } from "@/components/account-stat-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStoreProducts } from "@/lib/store-products";
import { AccountProducts } from "@/components/account-products";
import Link from "next/link";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const [orders, addresses, spending, recentOrders, products] = userId
    ? await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.address.count({ where: { userId } }),
        prisma.order.aggregate({ where: { userId }, _sum: { total: true } }),
        prisma.order.findMany({where:{userId},include:{items:{include:{product:true}}},orderBy:{createdAt:"desc"},take:3}),
        getStoreProducts(),
      ])
    : [0, 0, { _sum: { total: 0 } }, [], await getStoreProducts()];

  return (
    <AccountShell>
      <section
        className="account-overview"
        aria-labelledby="account-overview-title"
      >
        <div className="account-heading">
          <span className="eyebrow">My dashboard</span>
          <h1 id="account-overview-title">Welcome back, {session?.user?.name?.split(" ")[0] ?? "Customer"}</h1>
          <p>Here’s what’s happening with your Electzo account today.</p>
        </div>
        <div className="account-stat-grid">
          <AccountStatCard type="orders" value={orders} />
          <AccountStatCard type="spent" value={spending._sum.total ?? 0} />
          <AccountStatCard type="addresses" value={addresses} />
          <AccountStatCard type="wishlist" />
        </div>
        <div className="dashboard-columns"><section className="recent-orders-panel card"><header><div><h2>Recent orders</h2><p>Your latest purchases and their status.</p></div><Link href="/account/orders">View all →</Link></header>{recentOrders.length?recentOrders.map(o=>{const item=o.items[0];return <article key={o.id}><span className="recent-thumb" style={{background:item?.product.color??"#f3f4f4"}}>{item?.product.images[0]&&<img src={item.product.images[0]} alt=""/>}</span><div><b>{item?.name??`Order #${o.orderNumber}`}</b><small>#{o.orderNumber} · {o.createdAt.toLocaleDateString("en-IN")}</small></div><strong>₹{o.total.toLocaleString("en-IN")}</strong><span className={`order-pill ${o.status.toLowerCase()}`}>{o.status}</span></article>}):<div className="dashboard-empty"><p>No orders yet. Your purchases will appear here.</p><Link className="btn btn-yellow" href="/shop">Start shopping</Link></div>}</section><section className="delivery-panel card"><h2>Order activity</h2><p>Track every step from checkout to delivery.</p>{["Order placed","Confirmed","Shipped","Out for delivery","Delivered"].map((x,i)=><div className={i<2?"done":""} key={x}><i>{i<2?"✓":i+1}</i><span><b>{x}</b><small>{i<2?"Completed":"Upcoming update"}</small></span></div>)}</section></div>
        <AccountProducts products={products.slice(0,5)}/>
        <section className="bulk-account-banner"><div><small>BUSINESS PRICING</small><h2>Bulk electrical requirements?</h2><p>Get GST-ready quotes and special pricing for large orders.</p></div><Link className="btn btn-yellow" href="/bulk-order">Request bulk quote</Link></section>
      </section>
    </AccountShell>
  );
}
