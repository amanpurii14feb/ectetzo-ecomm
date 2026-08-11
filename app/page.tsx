import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getStoreProducts } from "@/lib/store-products";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/product-grid";
import { NewsletterForm } from "@/components/newsletter-form";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [products, categories, brands] = await Promise.all([
    getStoreProducts(),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,#8f6500_0%,transparent_38%)] opacity-50" />
        <div className="container relative grid min-h-[530px] items-center py-16 md:grid-cols-2">
          <div className="max-w-xl">
            <div className="eyebrow text-volt">
              India's electrical marketplace
            </div>
            <h1 className="mt-4 text-5xl font-black leading-[.98] tracking-[-.05em] md:text-7xl">
              Powering Every Connection
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-7 text-white/65">
              Shop trusted electrical products for homes, businesses and
              industries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn btn-yellow" href="/shop">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                className="btn border-white/30 text-white"
                href="/bulk-order"
              >
                Request Bulk Quote
              </Link>
            </div>
            <div className="mt-10 flex gap-8 text-xs text-white/50">
              <span>
                <b className="block text-xl text-white">30+</b>Top brands
              </span>
              <span>
                <b className="block text-xl text-white">10k+</b>Products
              </span>
              <span>
                <b className="block text-xl text-white">Pan India</b>Delivery
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Find your fit</div>
            <h2 className="section-title mt-2">Popular categories</h2>
          </div>
          <Link href="/shop" className="text-sm font-bold">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.slice(0, 14).map((c, i) => (
            <Link
              href={"/category/" + c.slug}
              className="card group p-4 hover:border-volt"
              key={c.id}
            >
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-paper text-xl font-black">
                {i + 1}
              </div>
              <b className="text-sm">{c.name}</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-paper">
        <div className="container section">
          <div className="eyebrow">Handpicked deals</div>
          <h2 className="section-title mb-8 mt-2">Featured products</h2>
          <ProductGrid items={products.slice(0, 8)} />
        </div>
      </section>
      <section className="container section">
        <div className="eyebrow">Most trusted</div>
        <h2 className="section-title mb-8 mt-2">Shop by brand</h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-gray-200 md:grid-cols-4">
          {brands.map((b) => (
            <Link
              href={"/brand/" + b.slug}
              className="grid h-28 place-items-center bg-white text-center text-lg font-black"
              key={b.id}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="container pb-16">
        <div className="rounded-xl bg-volt p-8 md:flex md:items-center md:justify-between md:p-12">
          <div>
            <div className="eyebrow text-ink">For contractors & businesses</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Big requirement? Get a better price.
            </h2>
            <p className="mt-2">
              Upload your BOM and receive a custom quote from our sourcing team.
            </p>
          </div>
          <Link href="/bulk-order" className="btn btn-dark mt-6 md:mt-0">
            Request a quote <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="bg-ink text-white">
        <div className="container section grid gap-8 md:grid-cols-4">
          {[
            [
              ShieldCheck,
              "Genuine products",
              "100% authentic, sourced directly",
            ],
            [Truck, "Reliable delivery", "Trackable shipping across India"],
            [Building2, "Business pricing", "Bulk rates and GST invoicing"],
            [Headphones, "Expert support", "Help choosing the right product"],
          ].map(([I, t, d]) => {
            const Icon = I as typeof ShieldCheck;
            return (
              <div key={String(t)}>
                <Icon className="text-volt" />
                <b className="mt-4 block">{String(t)}</b>
                <p className="text-sm text-white/50">{String(d)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="container section">
        <h2 className="section-title mb-8">Recently viewed</h2>
        <ProductGrid items={products.slice(12, 16)} />
      </section>
      <section className="bg-paper py-12">
        <div className="container text-center">
          <h2 className="text-2xl font-black">Stay current with Electzo</h2>
          <p className="mt-2 muted">
            Deals, new launches and practical electrical guides.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
