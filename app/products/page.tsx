import { searchCatalogue } from "@/lib/catalogue";
import { parseCatalogueQuery } from "@/lib/catalogue-query";
import { getShopSession } from "@/app/actions/shop";
import ProductListClient from "./ProductListClient";
import type { Metadata } from "next";

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const raw = await searchParams;
  const categoryValue = Array.isArray(raw.category) ? raw.category[0] : raw.category;
  const searchValue = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  const category = categoryValue?.trim();
  const search = searchValue?.trim();
  const title = category ? `${titleCase(category)} products` : search ? `Search results for “${search.slice(0, 60)}”` : "Shop all products";
  const description = category
    ? `Browse ${titleCase(category)} products at Mini Store. Compare product details, ratings, prices and availability.`
    : "Browse the complete Mini Store catalogue. Filter products by category and compare details, ratings, prices and availability.";
  const hasNonCategoryParams = Object.keys(raw).some(key => key !== "category");
  const canonical = category ? `/products?category=${encodeURIComponent(category)}` : "/products";
  return {
    title,
    description,
    alternates: { canonical },
    robots: search || hasNonCategoryParams ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, url: canonical },
  };
}

export default async function ProductListPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined) params.set(key, Array.isArray(value) ? value[0] : value);
  }
  const query = parseCatalogueQuery(params);
  const favourites = query.favsOnly ? (await getShopSession()).favs : [];
  const result = await searchCatalogue(query, favourites);
  return <ProductListClient result={result} query={query} />;
}
