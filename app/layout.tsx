import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { SiteChrome } from "@/components/site-chrome";
import { ApiLoader } from "@/components/api-loader";
export const metadata: Metadata = {
  title: "Electzo — Powering Every Connection",
  description:
    "Trusted electrical products for homes, businesses and industries.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          <ApiLoader />
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
