import type { Product } from "@/types";

export type CatalogueQuery = {
  search: string;
  category: string;
  sort: string;
  page: number;
  pageSize: number;
  favsOnly: boolean;
};
export type CatalogueResult = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: { categories: { value: string; count: number }[] };
};
const sorts = new Set(["relevance", "low-high", "high-low", "a-z", "z-a"]);
export function parseCatalogueQuery(params: URLSearchParams): CatalogueQuery {
  const integer = (key: string, fallback: number, max: number) => {
    const value = Number(params.get(key));
    return Number.isSafeInteger(value) && value > 0 ? Math.min(value, max) : fallback;
  };
  const sort = params.get("sort") ?? "relevance";
  return {
    search: (params.get("q") ?? params.get("search") ?? "").trim().slice(0, 200),
    category: (params.get("category") ?? "").trim().slice(0, 100),
    sort: sorts.has(sort) ? sort : "relevance",
    page: integer("page", 1, 1000000),
    pageSize: integer("pageSize", 24, 48),
    favsOnly: params.get("favs") === "true",
  };
}

/** Category counts reflect search/favourites, before the selected category. */
export function queryCatalogue(products: Product[], query: CatalogueQuery, favourites: number[] = []): CatalogueResult {
  const terms = query.search.toLowerCase().split(/\s+/).filter(Boolean);
  const favs = new Set(favourites);
  const matching = products.filter(product => {
    const text = `${product.title} ${product.description} ${product.category}`.toLowerCase();
    return terms.every(term => text.includes(term)) && (!query.favsOnly || favs.has(product.id));
  });
  const counts = new Map<string, number>();
  for (const product of matching) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  const filtered = matching.filter(product => !query.category || product.category === query.category);
  filtered.sort((a, b) => {
    let order = 0;
    switch (query.sort) {
      case "low-high": order = a.price - b.price; break;
      case "high-low": order = b.price - a.price; break;
      case "a-z": order = a.title.localeCompare(b.title); break;
      case "z-a": order = b.title.localeCompare(a.title); break;
      default: {
        const score = (product: Product) => terms.filter(term => product.title.toLowerCase().includes(term)).length;
        order = score(b) - score(a);
      }
    }
    return order || a.id - b.id;
  });
  const totalPages = Math.ceil(filtered.length / query.pageSize);
  const page = Math.min(query.page, totalPages || 1);
  return {
    items: filtered.slice((page - 1) * query.pageSize, page * query.pageSize),
    total: filtered.length, page, pageSize: query.pageSize, totalPages,
    facets: { categories: Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value)) },
  };
}
