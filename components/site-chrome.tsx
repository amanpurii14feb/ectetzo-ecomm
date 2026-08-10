"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreUI } from "@/components/store-ui";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  if (admin) return <>{children}</>;
  return <><Header /><main>{children}</main><Footer /><StoreUI /></>;
}
