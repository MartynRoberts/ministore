"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSessionId } from "./shop";
import { getShopStore } from "@/lib/shop-store";
import { getCheckoutProducts } from "@/lib/checkout-api";
import { fingerprint, parseCustomer, validateCheckout, type CheckoutState } from "@/lib/checkout";

export async function placeOrder(_previous: CheckoutState, form: FormData): Promise<CheckoutState> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { error: "Your session has expired. Please return to your basket." };
  const checkoutId = form.get("checkoutId");
  if (typeof checkoutId !== "string" || checkoutId.length > 100) return { error: "Invalid checkout. Please reload this page." };
  const store = getShopStore();
  const existing = store.orderForCheckout(sessionId, checkoutId);
  if (existing) redirect(`/orders/${existing.id}`);
  const draft = store.getCheckout(sessionId, checkoutId);
  if (!draft || draft.expiresAt < Date.now()) return { error: "This checkout has expired. Please reload to review your basket." };
  let customer;
  try { customer = parseCustomer(form); } catch (error) {
    return { error: error instanceof Error ? error.message : "Check your delivery details." };
  }
  const payment = form.get("payment");
  if (payment !== "approve" && payment !== "decline") return { error: "Choose a simulated payment outcome." };
  let products;
  try { products = await getCheckoutProducts(); } catch {
    return { error: "We cannot verify current prices and stock. Please try again shortly." };
  }
  let order;
  try {
    order = store.placeOrder(sessionId, checkoutId, shop => {
      if (draft.expiresAt < Date.now()) throw new Error("This checkout has expired. Please reload this page.");
      const quote = validateCheckout(shop, products);
      if (fingerprint(quote) !== draft.fingerprint) throw new Error("Your basket or its prices have changed. Reload checkout to review the updated total.");
      if (payment === "decline") throw new Error("Simulated payment declined. Your basket is unchanged. You can try again.");
      return { id: randomUUID(), createdAt: new Date().toISOString(), customer, quote, paymentStatus: "simulated-paid" as const };
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not place your order. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect(`/orders/${order.id}`);
}
