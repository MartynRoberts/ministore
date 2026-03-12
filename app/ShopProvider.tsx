"use client";

import React, { createContext, useContext, useMemo, useState, useTransition } from "react";
import * as actions from "@/app/actions/shop";

type Basket = Record<number, number>;

type ShopContextValue = {
  basket: Basket;
  favs: number[];
  addToBasket: (id: number) => void;
  toggleFav: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clearFavourites: () => void;
  pending: boolean;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({
  initialBasket,
  initialFavs,
  children,
}: {
  initialBasket: Basket;
  initialFavs: number[];
  children: React.ReactNode;
}) {
  const [basket, setBasket] = useState<Basket>(initialBasket);
  const [favs, setFavs] = useState<number[]>(initialFavs);
  const [pending, startTransition] = useTransition();

  const addToBasket = (id: number) => {
    setBasket((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

    startTransition(async () => {
      try {
        await actions.addToBasket(id);
      } catch {
        setBasket((prev) => {
          const nextQty = (prev[id] ?? 1) - 1;
          if (nextQty <= 0) {
            const { [id]: _, ...rest } = prev;
            return rest;
          }
          return { ...prev, [id]: nextQty };
        });
      }
    });
  };

  const toggleFav = (id: number) => {
    const wasFav = favs.includes(id);

    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    startTransition(async () => {
      try {
        await actions.toggleFav(id);
      } catch {
        setFavs((prev) => {
          const hasIt = prev.includes(id);
          if (wasFav && !hasIt) return [...prev, id];
          if (!wasFav && hasIt) return prev.filter((x) => x !== id);
          return prev;
        });
      }
    });
  };

  const setQty = (id: number, qty: number) => {
    const previousQty = basket[id] ?? 0;

    setBasket((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });

    startTransition(async () => {
      try {
        await actions.setBasketQty(id, qty);
      } catch {
        setBasket((prev) => {
          const next = { ...prev };
          if (previousQty <= 0) {
            delete next[id];
          } else {
            next[id] = previousQty;
          }
          return next;
        });
      }
    });
  };

  const clearFavourites = () => {
    const previousFavs = favs;

    setFavs([]);

    startTransition(async () => {
      try {
        await actions.clearFavourites();
      } catch {
        setFavs(previousFavs);
      }
    });
  };

  const value = useMemo(
    () => ({ basket, favs, addToBasket, toggleFav, setQty, clearFavourites, pending }),
    [basket, favs, pending]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}