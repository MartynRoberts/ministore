"use server";

import { quoteBasket } from "@/lib/basket";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionId } from "./shop";
import { getShopStore } from "@/lib/shop-store";
import { getCheckoutProducts } from "@/lib/checkout-api";
import { CheckoutValidationError, createCheckoutDraft, fingerprint, parseCustomer, validateCheckout, type CheckoutState } from "@/lib/checkout";

export async function placeOrder(_previous: CheckoutState, form: FormData): Promise<CheckoutState> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { error: "Your session has expired. Please return to your basket." };
  const checkoutId = form.get("checkoutId");
  if (typeof checkoutId !== "string" || checkoutId.length > 100) return { error: "Invalid checkout. Please reload this page." };
  const store = getShopStore();
  const existing = store.orderForCheckout(sessionId, checkoutId);
  if (existing) redirect(`/orders/${existing.id}`);
  const draft = store.getCheckout(sessionId, checkoutId);
  if (!draft || draft.expiresAt < Date.now()) return { error: "This checkout has expired. Return to your basket to reserve the items again." };
  let customer;
  try { customer = parseCustomer(form); } catch (error) {
    if (error instanceof CheckoutValidationError) return { error: error.message, fieldErrors: error.fieldErrors };
    return { error: error instanceof Error ? error.message : "Check your delivery details." };
  }
  const payment = form.get("payment");
  if (payment !== "approve" && payment !== "decline" && payment !== "pending") return { error: "Choose a simulated payment outcome." };
  let products;
  try { products = store.localProducts(await getCheckoutProducts(), checkoutId); } catch {
    store.releaseCheckout(sessionId, checkoutId);
    return { error: "We cannot verify current prices and stock. Please try again shortly." };
  }
  let order;
  try {
    order = store.placeOrder(sessionId, checkoutId, shop => {
      if (draft.expiresAt < Date.now()) throw new Error("This checkout has expired. Please reload this page.");
      const quote = validateCheckout(shop, products);
      if (fingerprint(quote) !== draft.fingerprint) throw new Error("Your basket or its prices have changed. Reload checkout to review the updated total.");
      if (payment === "decline") throw new Error("Simulated payment declined. Your basket is unchanged. Return to your basket to try again.");
      return { id: randomUUID(), createdAt: new Date().toISOString(), customer, quote, paymentStatus: payment === "pending" ? "simulated-pending" as const : "simulated-paid" as const };
    });
  } catch (error) {
    store.releaseCheckout(sessionId, checkoutId);
    return { error: error instanceof Error ? error.message : "We could not place your order. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}`);
}

export async function beginCheckout(): Promise<CheckoutState> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { error: "Your basket is empty." };
  const store = getShopStore();
  let products;
  try { products = await getCheckoutProducts(); } catch {
    return { error: "We cannot verify current prices. Please try again shortly." };
  }
  let id;
  try {
    store.seedInventory(products);
    const quote = quoteBasket(store.read(sessionId), products);
    if (!quote.canCheckout) return { error: "Your basket is empty or contains unavailable items." };
    const draft = createCheckoutDraft(quote);
    store.createCheckout(sessionId, draft);
    id = draft.id;
  } catch (error) { return { error: error instanceof Error ? error.message : "Unable to reserve stock." }; }
  redirect(`/checkout?id=${id}`);
}
