"use client";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreUI } from "@/components/store-ui";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/register";
  if (standalone) return <>{children}</>;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <StoreUI />
    </>
  );
}
