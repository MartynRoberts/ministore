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

The feed is https://dummyjson.com/products?limit=0 so local search, category
filters, basket lookup, and pagination cover the full catalogue. Requests have a
10-second timeout and a one-hour Next.js revalidation interval. HTTP, network,
JSON, and validation errors use `data/products.json`, a DummyJSON snapshot fetched
on 2026-09-07. A detail 404 returns null. Images still require network access.
Refresh the snapshot from the same endpoint, optionally selecting
`id,title,description,price,category,thumbnail,images`; retain its products envelope.

The session cookie is now `shop_session_dummyjson_v1`. Existing Fake Store baskets
and favourites start empty because the two providers reuse IDs for different products.
Prices retain the existing shop display convention; no currency conversion is applied.

Run API regression checks with `node --test tests/api.test.cjs` and type checks
with `npx tsc --noEmit`.
