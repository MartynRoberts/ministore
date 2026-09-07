import Link from "next/link";
import { getShopSession } from "@/app/actions/shop";
import { formatMoney } from "@/lib/money";

export default async function CheckoutPage() {
  const { basket } = await getShopSession();
  return <div className="mx-auto my-16 max-w-3xl px-4">
    <h1 className="mb-6 text-2xl font-bold">Review your basket</h1>
    {!basket.canCheckout ? <p>Your basket is empty or contains unavailable items.</p> : <>
      <ul className="mb-6 divide-y">
        {basket.lines.map(line => <li key={line.variantId} className="py-3">
          {line.title} — {line.variantLabel} × {line.quantity}
          <span className="float-right">{formatMoney(line.total, basket.currency)}</span>
        </li>)}
      </ul>
      <p>Delivery: {formatMoney(basket.delivery, basket.currency)}</p>
      <p className="my-4 text-xl font-bold">Total: {formatMoney(basket.total, basket.currency)}</p>
      <p className="mb-6">Payment is not available yet. No order has been placed.</p>
    </>}
    <Link href="/basket" className="underline">Return to basket</Link>
  </div>;
}
