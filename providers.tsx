"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Basket = Record<number, number>;

type ShopState = {
  basket: Basket;
  favs: number[];
  addToBasket: (id: number) => void;
  toggleFav: (id: number) => void;
};

const ShopContext = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [basket, setBasket] = useState<Basket>({});
  const [favs, setFavs] = useState<number[]>([]);

  const addToBasket = (id: number) => {
    setBasket((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const toggleFav = (id: number) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const value = useMemo(() => ({ basket, favs, addToBasket, toggleFav }), [basket, favs]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside <ShopProvider>");
  return ctx;
}