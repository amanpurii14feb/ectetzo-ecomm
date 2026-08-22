import { AccountShell } from "@/components/account-shell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ListFilter } from "lucide-react";

export default async function Page() {
  const session = await auth();
  const orders = session?.user?.id
    ? await prisma.order.findMany({ where: { userId: session.user.id }, include: { items: { include: { product: { select: { slug: true } } } } }, orderBy: { createdAt: "desc" } })
    : [];
  return (
    <AccountShell>
      <div className="orders-page">
        <div className="account-section-heading"><div><h1>Orders</h1><p>Track, view and manage all your orders.</p></div><button className="btn btn-outline"><ListFilter/> Filter</button></div>
        <div className="orders-table-card card"><div className="orders-table-scroll"><table><thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {orders.map(order=><tr key={order.id}><td>#{order.orderNumber}</td><td>{order.createdAt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td>{order.items.reduce((s,i)=>s+i.quantity,0)} items</td><td>₹{order.total.toLocaleString("en-IN")}</td><td><span className={`order-pill ${order.status.toLowerCase()}`}>{order.status}</span></td><td><div className="flex flex-wrap gap-3"><Link href={`/account/orders/${order.orderNumber}`}>View</Link>{order.status==="DELIVERED"&&order.items[0]&&<Link className="font-bold text-green-700" href={`/product/${order.items[0].product.slug}?review=1#reviews`}>Rate &amp; review</Link>}</div></td></tr>)}
        {!orders.length&&<tr><td colSpan={6} className="orders-empty">You have not placed any orders yet. <Link href="/shop">Start shopping</Link></td></tr>}
        </tbody></table></div><footer>Showing {orders.length} order{orders.length===1?"":"s"}</footer></div>
      </div>
    </AccountShell>
  );
}
