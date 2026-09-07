import type { Product } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Translate provider payloads into the stable model used by the shop. */
export function normalizeProduct(value: unknown): Product {
  if (!isRecord(value)) throw new Error("Invalid product");
  const image = isText(value.thumbnail)
    ? value.thumbnail
    : Array.isArray(value.images) ? value.images.find(isText) : undefined;
  if (
    typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id <= 0 ||
    !isText(value.title) || !isText(value.category) ||
    typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0 ||
    !isText(image)
  ) throw new Error("Invalid product fields");
  return {
    id: value.id,
    title: value.title.trim(),
    description: typeof value.description === "string" ? value.description : "",
    price: value.price,
    category: value.category,
    image,
  };
}

export function normalizeProducts(value: unknown): Product[] {
  if (!isRecord(value) || !Array.isArray(value.products)) {
    throw new Error("Invalid product catalogue");
  }
  return value.products.map(normalizeProduct);
}
