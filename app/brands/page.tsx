import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function Page() {
  const [brands, counts] = await Promise.all([
      prisma.brand.findMany({
        where: { active: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.groupBy({
        by: ["brand"],
        where: { active: true },
        _count: { _all: true },
      }),
    ]),
    map = new Map(counts.map((x) => [x.brand, x._count._all]));
  return (
    <div className="container section">
      <div className="eyebrow">Authorised selection</div>
      <h1 className="section-title mt-2">Shop leading brands</h1>
      <p className="mt-3 mb-9 muted">
        Genuine products from trusted electrical manufacturers.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {brands.map((b) => (
          <Link
            className="card p-8 text-center"
            href={`/brand/${b.slug}`}
            key={b.id}
          >
            <b className="text-xl">{b.name}</b>
            <span className="mt-2 block text-xs muted">
              {map.get(b.name) ?? 0} products
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
