import { createHash, randomUUID } from "node:crypto";
import { quoteBasket, validateQuantity, type BasketQuote, type StoredShop } from "./basket";
import type { OrderStatus, OrderEvent } from "./order-status";
import type { Product } from "@/types";

export type CheckoutProduct = Product & { stock: number };
export type Customer = { name: string; email: string; address: string; city: string; postcode: string };
export type CheckoutDraft = { id: string; fingerprint: string; quote: BasketQuote; expiresAt: number };
export type Order = { id: string; createdAt: string; customer: Customer; quote: BasketQuote; paymentStatus: "simulated-paid" | "simulated-pending" | "simulated-refunded" | "simulated-cancelled"; status?: OrderStatus; events?: OrderEvent[]; inventoryCommitted?: boolean };
export type CustomerField = keyof Customer;
export type CheckoutState = { error?: string; fieldErrors?: Partial<Record<CustomerField, string>> };

export class CheckoutValidationError extends Error {
  constructor(public fieldErrors: Partial<Record<CustomerField, string>>) {
    super(Object.values(fieldErrors)[0] ?? "Check the highlighted delivery details.");
    this.name = "CheckoutValidationError";
  }
}

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
  const errors: Partial<Record<CustomerField, string>> = {};
  const field = (name: CustomerField, min: number, max: number, label: string) => {
    const value = form.get(name);
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) errors[name] = `Enter your ${label.toLowerCase()}.`;
    else if (trimmed.length < min) errors[name] = `${label} must be at least ${min} characters.`;
    else if (trimmed.length > max) errors[name] = `${label} must be ${max} characters or fewer.`;
    return trimmed;
  };
  const customer = {
    name: field("name", 2, 100, "Full name"),
    email: field("email", 3, 254, "Email address"),
    address: field("address", 5, 200, "Address"),
    city: field("city", 2, 100, "Town or city"),
    postcode: field("postcode", 5, 12, "Postcode").toUpperCase(),
  };
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = "Enter a valid email address.";
  if (customer.postcode && !/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/.test(customer.postcode)) errors.postcode = "Enter a valid UK postcode.";
  if (Object.keys(errors).length) throw new CheckoutValidationError(errors);
  return customer;
}

export function createCheckoutDraft(quote: BasketQuote): CheckoutDraft {
  return { id: randomUUID(), fingerprint: fingerprint(quote), quote, expiresAt: Date.now() + 15 * 60 * 1000 };
}
