import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreUI } from "@/components/store-ui";
import { AuthProvider } from "@/components/auth-provider";
export const metadata: Metadata = {
  title: "Electzo — Powering Every Connection",
  description:
    "Trusted electrical products for homes, businesses and industries.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <StoreUI />
        </AuthProvider>
      </body>
    </html>
  );
}
