export { auth as proxy } from "@/auth";

export const config = {
  // Every customer-only page goes through Auth.js before it is rendered.
  // Auth.js uses `pages.signIn` and preserves the requested URL as callbackUrl.
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/wishlist/:path*",
    "/order-success/:path*",
  ],
};
