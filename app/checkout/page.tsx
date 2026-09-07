import Link from "next/link";

import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import { createCheckoutDraft, validateCheckout } from "@/lib/checkout";
import { formatMoney } from "@/lib/money";
import CheckoutForm from "./CheckoutForm";
import { getCheckoutProducts } from "@/lib/checkout-api";

export default async function CheckoutPage() {

  const sessionId = await getCurrentSessionId();
  if (!sessionId || !getShopStore().read(sessionId).lines.length) return <div className="mx-auto my-16 max-w-3xl px-4"><h1 className="text-2xl font-bold">Checkout</h1><p>Your basket is empty.</p><Link href="/basket">Return to basket</Link></div>;
  let products;
  try { products = await getCheckoutProducts(); } catch {
    return <div className="mx-auto my-16 max-w-3xl px-4"><h1 className="text-2xl font-bold">Checkout unavailable</h1><p>We cannot verify current prices and stock. Please try again shortly.</p><Link href="/checkout" className="block underline">Try again</Link><Link href="/basket">Return to basket</Link></div>;
  }
  let basket;
  try { basket = validateCheckout(getShopStore().read(sessionId), products); } catch {
    return <div className="mx-auto my-16 max-w-3xl px-4"><h1 className="text-2xl font-bold">Review your basket</h1><p>An item is unavailable or has insufficient stock. Please adjust your quantities.</p><Link href="/basket">Return to basket</Link></div>;
  }
  const draft = createCheckoutDraft(basket);
  getShopStore().createCheckout(sessionId, draft);
  const checkoutId = draft.id;
  return <div className="mx-auto my-16 max-w-3xl px-4">
    <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
    {!basket.canCheckout || !sessionId ? <p>Your basket is empty or contains unavailable items.</p> : <>
      <ul className="mb-6 divide-y">
        {basket.lines.map(line => <li key={line.variantId} className="py-3">
          {line.title} — {line.variantLabel} × {line.quantity}
          <span className="float-right">{formatMoney(line.total, basket.currency)}</span>
        </li>)}
      </ul>
      <p>Delivery: {formatMoney(basket.delivery, basket.currency)}</p>
      <p className="my-4 text-xl font-bold">Total: {formatMoney(basket.total, basket.currency)}</p>
      <CheckoutForm key={checkoutId} checkoutId={checkoutId} />
    </>}
    <Link href="/basket" className="mt-6 block underline">Return to basket</Link>
  </div>;
}
