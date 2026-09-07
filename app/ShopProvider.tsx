"use client";

import React, { createContext, useContext, useRef, useState, useTransition } from "react";
import * as actions from "@/app/actions/shop";
import type { DeliveryMethod, ShopSession } from "@/lib/basket";

type ShopContextValue = ShopSession & {
  addToBasket: (id: number, variantId?: string) => void;
  toggleFav: (id: number) => void;
  setQty: (variantId: string, quantity: number) => void;
  setDelivery: (method: DeliveryMethod) => void;
  clearFavourites: () => void;
  pending: boolean;
  error: string | null;
};
const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ initialSession, children }: { initialSession: ShopSession; children: React.ReactNode }) {
  const [state, setState] = useState({ initialSession, session: initialSession });
  if (state.initialSession !== initialSession) setState({ initialSession, session: initialSession });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const run = (action: () => Promise<ShopSession>) => {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const session = await action();
        setState(previous => ({ ...previous, session }));
      } catch {
        setError("We could not update your shop. Please try again.");
      } finally {
        busy.current = false;
      }
    });
  };
  const value: ShopContextValue = {
    ...state.session, pending, error,
    addToBasket: (id, variantId = `dummyjson-${id}-standard`) => run(() => actions.addToBasket(id, variantId)),
    toggleFav: id => run(() => actions.toggleFav(id)),
    setQty: (variantId, quantity) => run(() => actions.setBasketQty(variantId, quantity)),
    setDelivery: method => run(() => actions.setDelivery(method)),
    clearFavourites: () => run(actions.clearFavourites),
  };
  return <ShopContext.Provider value={value}>
    {error && <p role="alert" className="bg-red-50 p-3 text-red-800">{error}</p>}
    {children}
  </ShopContext.Provider>;
}
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside <ShopProvider>");
  return context;
}
