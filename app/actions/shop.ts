"use server";

import { cookies } from "next/headers";

type ShopSession = {
  basket: Record<number, number>;
  favs: number[];
};

const COOKIE_NAME = "shop_session";

async function readSession(): Promise<ShopSession> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) return { basket: {}, favs: [] };

  try {
    const parsed = JSON.parse(raw) as ShopSession;
    return {
      basket: parsed.basket ?? {},
      favs: parsed.favs ?? [],
    };
  } catch {
    return { basket: {}, favs: [] };
  }
}

async function writeSession(next: ShopSession) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function getShopSession() {
  return await readSession();
}

export async function addToBasket(productId: number) {
  const session = await readSession();
  session.basket[productId] = (session.basket[productId] ?? 0) + 1;
  await writeSession(session);
}

export async function toggleFav(productId: number) {
  const session = await readSession();

  const set = new Set(session.favs);
  if (set.has(productId)) {
    set.delete(productId);
  } else {
    set.add(productId);
  }

  session.favs = Array.from(set);
  await writeSession(session);
}

export async function setBasketQty(productId: number, qty: number) {
  const session = await readSession();

  if (qty <= 0) {
    delete session.basket[productId];
  } else {
    session.basket[productId] = qty;
  }

  await writeSession(session);
}

export async function clearBasket() {
  const session = await readSession();
  session.basket = {};
  await writeSession(session);
}

export async function clearFavourites() {
  const session = await readSession();
  session.favs = [];
  await writeSession(session);
}