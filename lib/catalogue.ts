import { api } from "./api";
import { queryCatalogue, type CatalogueQuery } from "./catalogue-query";

// Only server pages and route handlers import this service.
export async function searchCatalogue(query: CatalogueQuery, favourites: number[] = []) {
  return queryCatalogue(await api.getProducts(), query, favourites);
}
