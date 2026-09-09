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

## Testing

MiniStore has two complementary automated test layers:

- **Server and domain tests** use Node's built-in test runner. The 36 tests in
  `tests/*.test.cjs` cover product normalization and fallback behaviour,
  catalogue search and pagination, basket pricing and persistence, checkout and
  inventory transactions, order lifecycles, session isolation, and admin
  authentication.
- **Component tests** use Jest, JSDOM, React Testing Library, jest-dom, and
  `user-event`. The tests in `__tests__/components` cover the shared design
  system, native form behaviour, pagination, product-card actions, and admin
  password validation and visibility controls.

Run the complete suite before merging a change:

```bash
npm run test:ci
```

This runs all server tests followed by the Jest component tests in CI mode and
generates a coverage report in `coverage/`. The Jest report measures the
browser-facing TypeScript and React files configured in `jest.config.cjs`; the
Node server tests are validated separately and are not included in those Jest
coverage percentages.

Other useful commands:

| Command | Purpose |
| --- | --- |
| `npm test` | Run the Jest and React Testing Library component suite once. |
| `npm run test:watch` | Re-run relevant Jest tests while files change. |
| `npm run test:coverage` | Run Jest and write HTML and terminal coverage reports. |
| `npm run test:server` | Run the Node server and domain regression suite. |
| `npm run test:ci` | Run both suites and collect Jest coverage. |
| `npx tsc --noEmit` | Type-check application and test TypeScript. |
| `npm run lint` | Lint application and test sources. |
| `npm run build` | Verify the production Next.js build. |

Jest is configured through `jest.config.cjs`, with global DOM matchers loaded by
`jest.setup.cjs`. `next/jest` handles the Next.js transforms, CSS and image
imports, environment loading, and the `@/` path alias. Component tests run in
`jest-environment-jsdom`; the existing `.cjs` server tests remain assigned to
Node's test runner through an explicit Jest `testMatch`.

Write component tests from the user's perspective. Query elements by accessible
role, label, or visible text; use `userEvent.setup()` for interactions; and test
observable outcomes rather than component state or implementation details. Mock
only external boundaries such as server actions or navigation. Add server tests
for pricing, persistence, authorization, concurrency, and lifecycle rules. Avoid
snapshot-only tests for interactive behaviour.

For a pull request, the expected local validation is:

```bash
npm run test:ci
npm run lint
npm run build
```

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

Run the focused API regression file with `node --test tests/api.test.cjs`, or see
[Testing](#testing) for the complete validation workflow.

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

Checkout supports simulated payment and persisted demo orders, as described below. Live stock reservations remain future work.

See [Testing](#testing) for the complete server and component test commands.

## Demo checkout and orders

Checkout collects UK delivery details and offers simulated payment approval or
decline. It never collects card details, charges money, sends email or ships items.
The initial review and final submission both fetch uncached DummyJSON prices and
stock. Checkout stops on provider failure; the offline browsing catalogue cannot
approve an order. Stock checks aggregate quantities across the demo size variants.

Each review creates a session-bound checkout token valid for 30 minutes and a
fingerprint of the reviewed lines, prices and delivery. Submission validates the
customer details, current basket and live quote. Changes require a new review.
A decline leaves the basket intact and permits retrying the same checkout.

Approved demo payment stores an immutable order snapshot and clears the basket
in one SQLite transaction. The unique checkout token prevents duplicate orders:
retries return the existing order, including after a lost response. A second
checkout tab cannot repurchase an emptied basket. Confirmation at `/orders/[id]`
is restricted to the session that placed the order.

This simulator checks supplier stock but does not reserve or decrement it.
Production payments require a payment provider, verified webhooks, payment-attempt
persistence/reconciliation, inventory reservations and fulfilment integration.
Draft/order data is stored in the same private SQLite file; retention cleanup and
an account-based order history remain future work.

Run all checks with:

```bash
npm run test:ci
npm run lint
npm run build
```
