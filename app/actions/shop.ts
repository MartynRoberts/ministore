"use server";

import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { getShopStore } from "@/lib/shop-store";
import { emptyShop, quoteBasket, updateLine, validateProductId, validateQuantity, type ShopSession, type StoredShop, type DeliveryMethod } from "@/lib/basket";

const COOKIE_NAME = "ministore_session_v2";
const validSessionId = (id?: string): id is string => Boolean(id && /^[a-f0-9]{64}$/.test(id));
async function sessionId(create = false) {
  const jar = await cookies();
  const id = jar.get(COOKIE_NAME)?.value;
  if (validSessionId(id)) return id;
  if (!create) return null;
  const next = randomBytes(32).toString("hex");
  jar.set(COOKIE_NAME, next, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return next;
}
async function present(shop: StoredShop): Promise<ShopSession> {
  const products = shop.lines.length ? await api.getProducts() : [];
  return { basket: quoteBasket(shop, products), favs: shop.favs };
}
export async function getShopSession(): Promise<ShopSession> {
  const id = await sessionId();
  return present(id ? await getShopStore().read(id) : emptyShop());
}
async function mutate(change: (shop: StoredShop) => void) {
  const id = await sessionId(true);
  const shop = await getShopStore().update(id!, change);
  revalidatePath("/", "layout");
  return present(shop);
}
export async function addToBasket(productId: number, variantId: string) {
  validateProductId(productId);
  const product = await api.getProduct(productId);
  if (!product) throw new Error("This product is unavailable.");
  return mutate(shop => updateLine(shop, product, variantId, 1, true));
}
export async function setBasketQty(variantId: string, quantity: number) {
  validateQuantity(quantity);
  const id = await sessionId();
  if (!id) throw new Error("Your basket is empty.");
  const line = (await getShopStore().read(id)).lines.find(line => line.variantId === variantId);
  if (!line) throw new Error("This item is no longer in your basket.");
  // Removal must also work for products no longer in the catalogue.
  if (quantity === 0) return mutate(shop => { shop.lines = shop.lines.filter(line => line.variantId !== variantId); });
  const product = await api.getProduct(line.productId);
  if (!product) throw new Error("This product is unavailable. Please remove it.");
  return mutate(shop => {
    if (!shop.lines.some(line => line.variantId === variantId)) throw new Error("This item is no longer in your basket.");
    updateLine(shop, product, variantId, quantity);
  });
}
export async function setDelivery(method: DeliveryMethod) {
  if (!["standard", "premium", "next-day"].includes(method)) throw new Error("Invalid delivery option.");
  return mutate(shop => { shop.delivery = method; });
}
export async function toggleFav(productId: number) {
  validateProductId(productId);
  return mutate(shop => {
    if (shop.favs.includes(productId)) shop.favs = shop.favs.filter(id => id !== productId);
    else {
      if (shop.favs.length >= 500) throw new Error("You have reached the favourites limit.");
      shop.favs.push(productId);
    }
  });
}
export async function clearBasket() {
  return mutate(shop => { shop.lines = []; });
}
export async function clearFavourites() {
  return mutate(shop => { shop.favs = []; });
}

export async function getCurrentSessionId() {
  return sessionId();
}
