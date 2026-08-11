# Electzo e-commerce

Next.js + PostgreSQL COD e-commerce storefront with customer accounts and an admin panel.

## Local setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, and optional Google OAuth values.
2. Install dependencies with `npm install`.
3. Create/update tables with `npm run db:push`.
4. Seed products and the optional admin account with `npm run db:seed`.
5. Start the app with `npm run dev`.

To promote an existing account: `npm run admin:promote -- user@example.com`.

## Available features

- Product catalogue, search, filters, cart and wishlist.
- Credentials authentication and optional Google sign-in.
- Saved profile and address management with checkout autofill.
- COD checkout, atomic stock deduction, customer/admin cancellation and stock restoration.
- Customer order history and order details.
- Product, category, brand, inventory and order administration.
- Locally stored contact messages and newsletter subscribers under Admin → Messages.

Online payments, outbound email/SMS, courier tracking and cloud media storage require external providers and are intentionally not configured.

## Checks

- `npm run lint`
- `npm run build`
