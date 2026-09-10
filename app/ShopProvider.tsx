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
  const run = (action: () => Promise<ShopSession>, fallbackMessage: string) => {
    if (busy.current) return;
    busy.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const session = await action();
        setState(previous => ({ ...previous, session }));
      } catch (caught) {
        const message = caught instanceof Error && caught.message && !caught.message.includes("Server Components render")
          ? caught.message
          : fallbackMessage;
        setError(message);
      } finally {
        busy.current = false;
      }
    });
  };
  const value: ShopContextValue = {
    ...state.session, pending, error,
    addToBasket: (id, variantId = `dummyjson-${id}-standard`) => run(() => actions.addToBasket(id, variantId), "We could not add this product. Please try again."),
    toggleFav: id => run(() => actions.toggleFav(id), "We could not update your favourites. Please try again."),
    setQty: (variantId, quantity) => run(() => actions.setBasketQty(variantId, quantity), "We could not update this quantity. Please try again."),
    setDelivery: method => run(() => actions.setDelivery(method), "We could not update your delivery method. Please try again."),
    clearFavourites: () => run(actions.clearFavourites, "We could not clear your favourites. Please try again."),
  };
  return <ShopContext.Provider value={value}>
    {error && <div role="alert" className="fixed bottom-4 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-lg border border-danger bg-surface p-4 text-danger shadow-card">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v6m0 4h.01"/></svg>
      <p className="min-w-0 flex-1 text-sm font-medium">{error}</p>
      <button type="button" aria-label="Dismiss notification" onClick={() => setError(null)} className="-m-2 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-danger-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="m5 5 10 10M15 5 5 15"/></svg>
      </button>
    </div>}
    {children}
  </ShopContext.Provider>;
}
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside <ShopProvider>");
  return context;
}
