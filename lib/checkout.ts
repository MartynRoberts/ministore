import { createHash, randomUUID } from "node:crypto";
import { quoteBasket, validateQuantity, type BasketQuote, type StoredShop } from "./basket";
import type { OrderStatus, OrderEvent } from "./order-status";
import type { Product } from "@/types";

export type CheckoutProduct = Product & { stock: number };
export type Customer = { name: string; email: string; address: string; city: string; postcode: string };
export type CheckoutDraft = { id: string; fingerprint: string; quote: BasketQuote; expiresAt: number };
export type Order = { id: string; createdAt: string; customer: Customer; quote: BasketQuote; paymentStatus: "simulated-paid" | "simulated-pending" | "simulated-refunded" | "simulated-cancelled"; status?: OrderStatus; events?: OrderEvent[]; inventoryCommitted?: boolean };
export type CheckoutState = { error?: string };

export function fingerprint(quote: BasketQuote) {
  return createHash("sha256").update(JSON.stringify({
    lines: quote.lines.map(line => [line.productId, line.variantId, line.quantity, line.unitPrice]).sort((a, b) => String(a[1]).localeCompare(String(b[1]))),
    deliveryMethod: quote.deliveryMethod, delivery: quote.delivery, total: quote.total, currency: quote.currency,
  })).digest("hex");
}
export function validateCheckout(shop: StoredShop, products: CheckoutProduct[]): BasketQuote {
  if (!shop.lines.length) throw new Error("Your basket is empty.");
  const quantities = new Map<number, number>();
  for (const line of shop.lines) {
    validateQuantity(line.quantity);
    if (line.quantity === 0) throw new Error("Your basket contains an invalid quantity.");
    quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
  }
  for (const [id, quantity] of quantities) {
    const product = products.find(product => product.id === id);
    if (!product || !Number.isSafeInteger(product.stock) || product.stock < quantity) {
      throw new Error("An item has insufficient stock. Please update your basket.");
    }
  }
  const quote = quoteBasket(shop, products);
  if (!quote.canCheckout || !Number.isSafeInteger(quote.total) || quote.total <= 0) throw new Error("Your basket contains an unavailable item.");
  return quote;
}
export function parseCustomer(form: FormData): Customer {
  const field = (name: string, max: number) => {
    const value = form.get(name);
    if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("Please complete all delivery details correctly.");
    return value.trim();
  };
  const customer = { name: field("name", 100), email: field("email", 254), address: field("address", 200), city: field("city", 100), postcode: field("postcode", 12).toUpperCase() };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new Error("Enter a valid email address.");
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(customer.postcode)) throw new Error("Enter a valid UK postcode.");
  return customer;
}

export function createCheckoutDraft(quote: BasketQuote): CheckoutDraft {
  return { id: randomUUID(), fingerprint: fingerprint(quote), quote, expiresAt: Date.now() + 15 * 60 * 1000 };
}
