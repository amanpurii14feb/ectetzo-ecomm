import { AccountShell } from "@/components/account-shell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Page() {
  const session = await auth();
  const orders = session?.user?.id
    ? await prisma.order.findMany({ where: { userId: session.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } })
    : [];
  return (
    <AccountShell>
      <div>
        <h1 className="section-title">Your orders</h1>
        {!orders.length && <div className="card mt-7 p-6"><p className="muted">You have not placed any orders yet.</p><Link className="btn btn-yellow mt-4" href="/shop">Start shopping</Link></div>}
        {orders.map((order) => (
          <div className="card mt-7 p-5" key={order.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div><b>Order #{order.orderNumber}</b><p className="text-sm muted">Placed on {order.createdAt.toLocaleDateString("en-IN")} · ₹{order.total.toLocaleString("en-IN")}</p></div>
              <span className="h-fit rounded bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{order.status}</span>
            </div>
            <div className="mt-5 flex justify-between border-t pt-4 text-sm"><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {order.paymentMethod}</span><Link className="font-bold" href={`/account/orders/${order.orderNumber}`}>View details →</Link></div>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}
