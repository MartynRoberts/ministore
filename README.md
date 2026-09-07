This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Product API

`lib/api.ts` exposes `getProducts(): Promise<Product[]>` and
`getProduct(id): Promise<Product | null>`. The UI uses the provider-independent
`Product` type in `types/index.ts`; `lib/products.ts` validates DummyJSON payloads
and maps `thumbnail` (or the first gallery image) to `image`.

The feed is https://dummyjson.com/products?limit=0. The server catalogue service
queries this cached feed for consistent combined filters and facets. Requests have a
10-second timeout and a one-hour Next.js revalidation interval. HTTP, network,
JSON, and validation errors use `data/products.json`, a DummyJSON snapshot fetched
on 2026-09-07. A detail 404 returns null. Images still require network access.
Refresh the snapshot from the same endpoint, optionally selecting
`id,title,description,price,category,thumbnail,images`; retain its products envelope.

See the persistent-basket section below for current session storage. Prices retain the existing shop display convention; no currency conversion is applied.

Run API regression checks with `node --test tests/api.test.cjs` and type checks
with `npx tsc --noEmit`.

## Server-driven catalogue and search

`lib/catalogue.ts` is the server service used by the products page and HTTP routes.
`lib/catalogue-query.ts` defines the normalized query/result contract and applies
search, category, favourites, sorting, and pagination before returning results.
The browser receives one page (24 products by default, maximum 48).

- `GET /api/products?q=shirt&category=mens-shirts&sort=low-high&page=1&pageSize=24`
  returns `{ items, total, page, pageSize, totalPages, facets: { categories } }`.
  Sorts: `relevance`, `low-high`, `high-low`, `a-z`, `z-a`.
  The existing `search` query parameter is also supported; `q` takes precedence.
- Category facets contain `{ value, count }`, reflecting search and favourites
  before category selection. All search terms must match title, description or
  category; relevance prefers title matches and ties use product ID.
- `favs=true` uses the current session's favourites. Product API responses are
  private and not cached by the browser/shared CDN.
- `GET /api/products/suggestions?q=shirt` returns at most four lightweight
  suggestions. Queries shorter than two characters return an empty list.
- The header waits 300 ms after typing, cancels superseded requests, and displays
  loading, empty and failure states. Enter and the all-results link navigate to
  the full search page. Escape or leaving the search panel closes suggestions.
- Product-page navigation uses Next.js server rendering and calls the catalogue
  service directly, without an internal HTTP round trip. Search, category, sort,
  favourites and page remain bookmarkable. Controls show pending navigation.

DummyJSON remains the provider, with a cached full catalogue queried on the
server. This is a demo implementation of the search-service boundary, not a
production search index. A larger catalogue should replace that implementation
with indexed queries while preserving the storefront contract. Basket persistence and variants are described below.

## Persistent basket and variants

Requires Node.js 24+. Basket lines, favourites and the delivery choice are stored
in SQLite at `.data/ministore.sqlite` (ignored by Git). Override the runtime path
with `MINISTORE_DB_PATH`. Use a persistent disk for this single-host demo; a
multi-instance/serverless deployment needs a shared database implementation.
The database is created lazily on the first session mutation.

Only a random session ID is stored in the `ministore_session_v2` cookie. It is
HttpOnly, SameSite=Lax, Secure in production, and expires after 30 days. Old
cookie-based baskets and favourites start empty; their untrusted contents are
not imported into the database. The database file must be preserved across
restarts to preserve sessions. Expired-session database cleanup is not yet scheduled.

`lib/basket.ts` defines the variant and basket contracts. Clothing products use
MiniStore demo variants S/M/L/XL; other products have one Standard variant.
These are not supplier inventory records. Basket mutations validate the product,
variant and whole-number quantity (0 removes a line; maximum 99). Each size has
its own basket line. SQLite transactions prevent lost updates within a session.

The server returns a fresh basket quote after each mutation. Monetary amounts
in that quote are integer pence with currency GBP, retaining the existing demo
price convention without currency conversion. Standard delivery costs £3.50,
or is free at £100; premium costs £4.50 and next-day £5.00. The server recalculates
these amounts when quantities or delivery change. A catalogue outage can still
use the demo fallback; these are browsing estimates, not payment authorisation.

Checkout now displays a server-rendered basket review. Payment, order placement,
live stock reservations and final checkout validation remain future work.

Run all regression tests with `node --test tests/api.test.cjs tests/basket.test.cjs`.
