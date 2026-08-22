import "./globals.css";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { SiteChrome } from "@/components/site-chrome";
import { ApiLoader } from "@/components/api-loader";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Electzo — Powering Every Connection",
  description:
    "Trusted electrical products for homes, businesses and industries.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={manrope.variable}>
        <AuthProvider>
          <ApiLoader />
          <SiteChrome>{children}</SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
