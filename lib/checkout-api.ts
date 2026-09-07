import { normalizeProduct } from "./products";
import type { CheckoutProduct } from "./checkout";

/** Checkout must never authorise an order from a stale/offline catalogue. */
export async function getCheckoutProducts(): Promise<CheckoutProduct[]> {
  const response = await fetch("https://dummyjson.com/products?limit=0", { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Catalogue unavailable");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("products" in data) || !Array.isArray(data.products)) throw new Error("Invalid catalogue");
  return data.products.map((value: unknown) => {
    const product = normalizeProduct(value);
    const stock = (value as Record<string, unknown>).stock;
    if (typeof stock !== "number" || !Number.isSafeInteger(stock) || stock < 0) throw new Error("Invalid stock");
    return { ...product, stock };
  });
}
