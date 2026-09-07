import type { Product } from "@/types";

export type Variant = { id: string; label: string };
export type BasketLine = { productId: number; variantId: string; quantity: number };
export type DeliveryMethod = "standard" | "premium" | "next-day";
export type StoredShop = { lines: BasketLine[]; favs: number[]; delivery: DeliveryMethod };
export type QuotedLine = BasketLine & { title: string; image: string; variantLabel: string; unitPrice: number; total: number; available: boolean };
export type BasketQuote = { lines: QuotedLine[]; currency: "GBP"; subtotal: number; delivery: number; total: number; count: number; canCheckout: boolean; deliveryMethod: DeliveryMethod };
export type ShopSession = { basket: BasketQuote; favs: number[] };
export const emptyShop = (): StoredShop => ({ lines: [], favs: [], delivery: "standard" });
export const MAX_QUANTITY = 99;

// Demo variants belong to MiniStore; DummyJSON has no size-level catalogue.
export function getVariants(product: Pick<Product, "id" | "category">): Variant[] {
  const labels = ["mens-shirts", "womens-dresses", "tops"].includes(product.category) ? ["S", "M", "L", "XL"] : ["Standard"];
  return labels.map(label => ({ id: `dummyjson-${product.id}-${label.toLowerCase()}`, label }));
}
export function validateQuantity(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) throw new Error(`Quantity must be between 0 and ${MAX_QUANTITY}.`);
}
export function validateProductId(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid product.");
}
export function updateLine(shop: StoredShop, product: Product, variantId: string, quantity: number, increment = false) {
  validateProductId(product.id);
  validateQuantity(quantity);
  if (!getVariants(product).some(variant => variant.id === variantId)) throw new Error("Choose a valid product option.");
  const existing = shop.lines.find(line => line.variantId === variantId);
  const nextQuantity = quantity + (increment ? existing?.quantity ?? 0 : 0);
  validateQuantity(nextQuantity);
  if (nextQuantity === 0) shop.lines = shop.lines.filter(line => line.variantId !== variantId);
  else if (existing) existing.quantity = nextQuantity;
  else {
    if (shop.lines.length >= 100) throw new Error("Your basket has reached its item limit.");
    shop.lines.push({ productId: product.id, variantId, quantity: nextQuantity });
  }
}
export function quoteBasket(shop: StoredShop, products: Product[]): BasketQuote {
  const lines = shop.lines.map(line => {
    const product = products.find(product => product.id === line.productId);
    const variant = product && getVariants(product).find(variant => variant.id === line.variantId);
    const unitPrice = product ? Math.round(product.price * 100) : 0;
    return { ...line, title: product?.title ?? "Unavailable product", image: product?.image ?? "", variantLabel: variant?.label ?? "Unavailable option", unitPrice, total: unitPrice * line.quantity, available: Boolean(product && variant) };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const delivery = !lines.length ? 0 : shop.delivery === "standard" ? (subtotal >= 10000 ? 0 : 350) : shop.delivery === "premium" ? 450 : 500;
  return { lines, currency: "GBP", subtotal, delivery, total: subtotal + delivery, count: lines.reduce((sum, line) => sum + line.quantity, 0), canCheckout: lines.length > 0 && lines.every(line => line.available), deliveryMethod: shop.delivery };
}
