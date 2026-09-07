import { searchCatalogue } from "@/lib/catalogue";
import { parseCatalogueQuery } from "@/lib/catalogue-query";
import { getShopSession } from "@/app/actions/shop";
import ProductListClient from "./ProductListClient";

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
