import Link from "next/link";
import { Logo } from "./logo";
import { Mail, MapPin, Phone } from "lucide-react";
export function Footer() {
  return (
    <footer className="site-footer bg-ink pt-14 text-white">
      <div className="container footer-grid grid gap-10 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 text-sm leading-6 text-white/60">
            Trusted electrical products for homes, businesses and industries.
          </p>
        </div>
        <div>
          <b>Shop</b>
          <div className="mt-4 grid gap-3 text-sm text-white/60">
            <Link href="/shop">All products</Link>
            <Link href="/brands">Brands</Link>
            <Link href="/bulk-order">Bulk orders</Link>
            <Link href="/wishlist">Wishlist</Link>
          </div>
        </div>
        <div>
          <b>Customer care</b>
          <div className="mt-4 grid gap-3 text-sm text-white/60">
            <Link href="/contact">Contact us</Link>
            <Link href="/shipping-policy">Shipping policy</Link>
            <Link href="/return-policy">Returns</Link>
            <Link href="/privacy-policy">Privacy & terms</Link>
          </div>
        </div>
        <div>
          <b>Get in touch</b>
          <div className="mt-4 grid gap-3 text-sm text-white/60">
            <span className="flex gap-2">
              <Phone size={16} />
              1800 202 8658
            </span>
            <span className="flex gap-2">
              <Mail size={16} />
              care@electzo.in
            </span>
            <span className="flex gap-2">
              <MapPin size={16} />
              Bengaluru, India
            </span>
          </div>
        </div>
      </div>
      <div className="container mt-12 flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/50">
        <span>© 2026 Electzo. All rights reserved.</span>
        <span>Secure payments · Genuine products · GST invoices</span>
      </div>
    </footer>
  );
}
