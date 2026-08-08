import { brands, products } from "@/data/products";
import Link from "next/link";
export default function Page() {
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
            href={"/brand/" + b.toLowerCase().replaceAll(" ", "-")}
            key={b}
          >
            <b className="text-xl">{b}</b>
            <span className="mt-2 block text-xs muted">
              {products.filter((p) => p.brand === b).length} products
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
