"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Package, WalletCards } from "lucide-react";
import { useStore } from "@/stores/use-store";

const cards = {
  orders: {
    label: "Orders",
    helper: "View your recent purchases",
    href: "/account/orders",
    icon: Package,
  },
  addresses: {
    label: "Saved addresses",
    helper: "Manage delivery locations",
    href: "/account/addresses",
    icon: MapPin,
  },
  spent: { label: "Total spent", helper: "View spending summary", href: "/account/orders", icon: WalletCards },
  wishlist: {
    label: "Wishlist items",
    helper: "View your saved products",
    href: "/wishlist",
    icon: Heart,
  },
} as const;

export function AccountStatCard({
  type,
  value,
  detail,
}: {
  type: keyof typeof cards;
  value?: number;
  detail?: string;
}) {
  const config = cards[type];
  const Icon = config.icon;
  const wishlistCount = useStore((state) => state.wishlist.length);
  const hydrated = useStore((state) => state.hydrated);
  const count = type === "wishlist" ? (hydrated ? wishlistCount : null) : value;

  return (
    <Link className="account-stat-card" href={config.href}>
      <span className="account-stat-icon">
        <Icon size={21} strokeWidth={1.9} />
      </span>
      <span className={`account-mini-chart chart-${type}`} aria-hidden="true">
        {type === "orders" && (
          <svg viewBox="0 0 132 55"><path d="M2 51 18 33 34 41 55 15 73 38 88 30 103 43 123 18 130 25" /><path className="fill" d="M2 51 18 33 34 41 55 15 73 38 88 30 103 43 123 18 130 25V55H2Z" /></svg>
        )}
        {(type === "addresses" || type === "spent") && <><i /><i /><i /><i /><i /></>}
        {type === "wishlist" && <span><i /><i /><i /></span>}
      </span>
      <span className="account-stat-copy">
        <strong>{count == null ? "—" : type === "spent" ? `₹${count.toLocaleString("en-IN")}` : String(count).padStart(2, "0")}</strong>
        <b>{config.label}</b>
      </span>
      <span className="account-stat-action">
        {detail ?? config.helper} <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}
