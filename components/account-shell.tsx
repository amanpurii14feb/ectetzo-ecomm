"use client";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clearCommerceData } from "@/stores/use-store";
const links = [
  ["Overview", "/account", LayoutDashboard],
  ["Orders", "/account/orders", Package],
  ["Profile", "/account/profile", UserRound],
  ["Addresses", "/account/addresses", MapPin],
  ["Wishlist", "/wishlist", Heart],
  ["Security", "/account/security", ShieldCheck],
];
export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "Customer";
  return (
    <div className="account-page">
      <div className="container account-layout">
        <aside className="account-sidebar">
          <div className="account-profile">
            <span>{displayName[0]?.toUpperCase()}</span>
            <div>
              <small>Welcome back</small>
              <b title={displayName}>{displayName}</b>
              <small className="account-email">{session?.user?.email}</small>
              <em>✓ Verified</em>
            </div>
          </div>
          <nav className="account-nav" aria-label="Account navigation">
            {links.map((x) => (
              <Link
                className={`account-side-link ${pathname === x[1] ? "active" : ""}`}
                href={x[1] as string}
                key={x[0] as string}
                aria-current={pathname === x[1] ? "page" : undefined}
              >
                {(() => {
                  const Icon = x[2] as typeof Heart;
                  return <Icon size={18} strokeWidth={1.9} />;
                })()}
                <span>{x[0] as string}</span>
              </Link>
            ))}
            <button
              onClick={async () => {
                clearCommerceData();
                await signOut({ callbackUrl: "/login" });
              }}
              className="account-side-link account-logout"
            >
              <LogOut size={18} strokeWidth={1.9} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>
        <main className="account-content">{children}</main>
      </div>
    </div>
  );
}
