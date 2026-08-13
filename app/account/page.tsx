import { AccountShell } from "@/components/account-shell";
import { AccountStatCard } from "@/components/account-stat-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;
  const [orders, addresses, spending] = userId
    ? await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.address.count({ where: { userId } }),
        prisma.order.aggregate({ where: { userId }, _sum: { total: true } }),
      ])
    : [0, 0, { _sum: { total: 0 } }];

  return (
    <AccountShell>
      <section
        className="account-overview"
        aria-labelledby="account-overview-title"
      >
        <div className="account-heading">
          <span className="eyebrow">My dashboard</span>
          <h1 id="account-overview-title">Account overview</h1>
          <p>Manage your orders, profile and saved addresses.</p>
        </div>
        <div className="account-stat-grid">
          <AccountStatCard type="orders" value={orders} />
          <AccountStatCard type="spent" value={spending._sum.total ?? 0} />
          <AccountStatCard type="addresses" value={addresses} />
          <AccountStatCard type="wishlist" />
        </div>
        <section className="account-recent"><div><b>Recent activity</b><p>You’re all caught up. Your latest orders will appear here.</p></div><a className="btn btn-yellow" href="/shop">Start shopping</a></section>
      </section>
    </AccountShell>
  );
}
