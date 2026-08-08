"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Package } from "lucide-react";
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
}: {
  type: keyof typeof cards;
  value?: number;
}) {
  const config = cards[type];
  const Icon = config.icon;
  const wishlistCount = useStore((state) => state.wishlist.length);
  const hydrated = useStore((state) => state.hydrated);
  const count = type === "wishlist" ? (hydrated ? wishlistCount : null) : value;

  return (
    <Link className="account-stat-card" href={config.href}>
      <span className="account-stat-accent" aria-hidden="true" />
      <span className="account-stat-icon">
        <Icon size={21} strokeWidth={1.9} />
      </span>
      <strong>{count == null ? "—" : String(count).padStart(2, "0")}</strong>
      <b>{config.label}</b>
      <span className="account-stat-action">
        {config.helper} <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}
