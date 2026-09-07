import localProducts from "@/data/products.json";
import type { Product } from "@/types";
import { normalizeProduct, normalizeProducts } from "./products";

const BASE_URL = "https://dummyjson.com";
const fallbackProducts = () => normalizeProducts(localProducts);

async function request(path: string): Promise<unknown | null> {
  const response = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Products API failed: ${response.status}`);
  return response.json();
}

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      // Search, filters, and pagination operate on the entire catalogue locally.
      return normalizeProducts(await request("/products?limit=0"));
    } catch (error) {
      console.error("Using the offline product catalogue:", error);
      return fallbackProducts();
    }
  },
  async getProduct(id: number): Promise<Product | null> {
    if (!Number.isSafeInteger(id) || id <= 0) return null;
    try {
      const data = await request(`/products/${id}`);
      if (data === null) return null;
      const product = normalizeProduct(data);
      if (product.id !== id) throw new Error("Product ID does not match request");
      return product;
    } catch (error) {
      console.error("Using the offline product catalogue:", error);
      return fallbackProducts().find((product) => product.id === id) ?? null;
    }
  },
};
