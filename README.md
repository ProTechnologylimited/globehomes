# GlobeHomes

International real estate site for sales, lease and investment listings, with a paid inspection on every property. Next.js (App Router), TypeScript, Tailwind v4, Stripe Checkout, Supabase, with an admin panel.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys
npm run dev
```

Open http://localhost:3000.

## Set up Stripe

1. Put your test `STRIPE_SECRET_KEY` in `.env.local`.
2. Forward webhooks in development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
3. In production, create a webhook endpoint at `https://YOUR-DOMAIN/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`.

The inspection amount is always calculated on the server in `src/lib/pricing.ts`. The browser never sends a price.

## Set up Supabase

Run `supabase/schema.sql` in the Supabase SQL editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Without them the site still runs and takes payments, but bookings are not stored.

## Admin panel

Open `/admin` and sign in with `ADMIN_PASSWORD` (set `ADMIN_SESSION_SECRET` too). From there you can:

- **Listings and images:** upload a front-view photo or paste an https image URL for any property, edit price, country, type and category, hide or delete listings, or add new ones. The first time, click "Import 25 sample listings" so they can be edited.
- **Inspection pricing:** change the percentage, minimum and maximum for sales and rentals and the 48-hour priority add-on. A single listing can have a fixed fee instead.
- **Categories:** add, rename, hide or delete housing categories. They appear as filters on the public site.
- **Dashboard:** recent inspection bookings and revenue.

Admin changes need Supabase. Run `supabase/schema.sql` first; it also creates the public `listing-images` storage bucket.

## Inspection pricing defaults

- Sale and investment: 0.08% of price, minimum $249, maximum $1,499
- Rental: 4% of one month's rent, minimum $129, maximum $399
- Optional 48-hour priority report: +$79

These are only the starting values. After setup the admin panel controls them, and the server always recalculates the fee at checkout.

## Images

Listings without a photo show a drawn front view of the house, so no card is ever blank. Add real photos in the admin panel.

## Listings

`src/lib/data.ts` holds 25 sample listings across 12 countries, priced from published 2026 market ranges. They are not live offers. After the one-time import they live in the `listings` table; replace them with real inventory or a licensed listings feed before launch.

## Deploy

Push to GitHub, import the repo in Vercel (or Render), and add the same environment variables. Set `NEXT_PUBLIC_SITE_URL` to your live domain.
