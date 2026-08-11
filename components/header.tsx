"use client";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Logo } from "./logo";
import { clearCommerceData, useStore } from "@/stores/use-store";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { signOut, useSession } from "next-auth/react";
export function Header() {
  const { products } = useProducts();
  const nav = useMemo(() => {
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ].slice(0, 5);
    return [
      ["Shop", "/shop"],
      ...categories.map((category) => [
        category,
        `/category/${category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}`,
      ]),
      ["Brands", "/brands"],
      ["Bulk Orders", "/bulk-order"],
    ];
  }, [products]);
  const [open, setOpen] = useState(false),
    [q, setQ] = useState(""),
    [suggestions, setSuggestions] = useState<Product[]>([]),
    [searching, setSearching] = useState(false);
  const r = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const displayName = user?.name ?? user?.email ?? "Customer";
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "Customer";
  const initial = displayName.charAt(0).toUpperCase();
  const cart = useStore((s) => s.cart),
    wish = useStore((s) => s.wishlist);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      r.push("/search?q=" + encodeURIComponent(q.trim()));
      setOpen(false);
    }
  };
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/products?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const body = await response.json();
        if (response.ok)
          setSuggestions((body.products as Product[]).slice(0, 5));
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError")
          setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [q]);
  const logout = async () => {
    clearCommerceData();
    await signOut({ callbackUrl: "/login" });
  };
  return (
    <>
      <div className="bg-volt py-2 text-center text-xs font-bold">
        Free shipping above ₹999 · GST invoice available · Bulk pricing for
        businesses
      </div>
      <header className="site-header sticky top-0 z-[70] bg-ink text-white">
        <div className="container flex h-20 items-center gap-7">
          <Logo />
          <form
            onSubmit={submit}
            className="search-form desktop-only relative flex h-12 flex-1 rounded-lg bg-white"
          >
            <span className="search-prefix">
              <Search size={18} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-w-0 flex-1 px-2 text-sm text-ink outline-none"
              placeholder="Search from 10,000+ electrical products"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="search-clear"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
            <button className="search-submit text-ink" aria-label="Search">
              <Search size={17} strokeWidth={2.5} />
            </button>
            {q.trim().length >= 2 && (
              <div className="search-suggestions">
                {searching && (
                  <div className="search-suggestion-state">
                    Searching products...
                  </div>
                )}
                {!searching && suggestions.length === 0 && (
                  <div className="search-suggestion-state">
                    No products found
                  </div>
                )}
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={() => setQ("")}
                  >
                    <span>
                      <b>{p.name}</b>
                      <small>
                        {p.brand} · {p.category}
                      </small>
                    </span>
                    <strong>₹{p.price.toLocaleString("en-IN")}</strong>
                  </Link>
                ))}
                <button type="submit">View all results for “{q}”</button>
              </div>
            )}
          </form>
          <div className="header-actions ml-auto flex items-center gap-2">
            <div className="account-menu desktop-only relative">
              <Link
                href={user ? "/account" : "/login"}
                className="header-action account-trigger"
              >
                <span className="header-action-icon">
                  <User size={19} />
                </span>
                <span>
                  <small>
                    {status === "loading"
                      ? "Checking account..."
                      : user
                        ? `Hello, ${firstName}`
                        : "Hello, sign in"}
                  </small>
                  <b>{user ? "My account" : "Sign in"}</b>
                </span>
                {user && <ChevronDown size={14} />}
              </Link>
              {user && (
                <div className="account-popover">
                  <div className="account-popover-head">
                    <span>{initial}</span>
                    <div>
                      <b>{displayName}</b>
                      {user.email && <small>{user.email}</small>}
                    </div>
                  </div>
                  <Link href="/account/orders">
                    <Package size={17} /> My orders
                  </Link>
                  <Link href="/account/addresses">
                    <MapPin size={17} /> Saved addresses
                  </Link>
                  <Link href="/wishlist">
                    <Heart size={17} /> My wishlist
                  </Link>
                  <Link className="account-manage" href="/account">
                    Manage account →
                  </Link>
                  <button
                    className="account-signout"
                    type="button"
                    onClick={logout}
                  >
                    <LogOut size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
            <Link
              href="/wishlist"
              className="header-icon-button"
              aria-label="Wishlist"
            >
              <Heart />
              {wish.length > 0 && (
                <b className="absolute -right-2 -top-2 rounded-full bg-volt px-1 text-[10px] text-ink">
                  {wish.length}
                </b>
              )}
            </Link>
            <Link href="/cart" className="header-icon-button" aria-label="Cart">
              <ShoppingCart />
              {Object.values(cart).reduce((a, b) => a + b, 0) > 0 && (
                <b className="absolute -right-2 -top-2 rounded-full bg-volt px-1 text-[10px] text-ink">
                  {Object.values(cart).reduce((a, b) => a + b, 0)}
                </b>
              )}
            </Link>
            <button onClick={() => setOpen(!open)} className="mobile-only">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav className="desktop-only border-t border-white/10">
          <div className="container flex h-12 items-center gap-7 text-[13px] font-bold">
            {nav.map((n) => (
              <Link
                className={
                  pathname === n[1] || pathname.startsWith(`${n[1]}/`)
                    ? "nav-active"
                    : ""
                }
                key={n[0]}
                href={n[1]}
              >
                {n[0]}
              </Link>
            ))}
          </div>
        </nav>
        {open && (
          <div className="mobile-only container flex-col gap-1 pb-5">
            <form
              onSubmit={submit}
              className="mb-2 flex overflow-hidden rounded-md bg-white"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="min-w-0 flex-1 px-3 py-3 text-sm text-ink outline-none"
                placeholder="Search products..."
              />
              <button className="bg-volt px-4 text-ink">
                <Search size={18} />
              </button>
            </form>
            {nav.map((n) => (
              <Link
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3"
                key={n[0]}
                href={n[1]}
              >
                {n[0]}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-2 border-t border-white/10 py-3 font-bold"
                  href="/account"
                >
                  <User size={18} /> My account
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 py-3 font-bold"
                >
                  <LogOut size={18} /> Sign out
                </button>
              </>
            ) : (
              <Link
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 border-t border-white/10 py-3 font-bold"
                href="/login"
              >
                <User size={18} /> Sign in
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
