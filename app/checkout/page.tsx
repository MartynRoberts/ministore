import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import { formatMoney } from "@/lib/money";
import CheckoutForm from "./CheckoutForm";
import StartCheckout from "./StartCheckout";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sessionId = await getCurrentSessionId();
  const { id } = await searchParams;
  const draft = sessionId && id ? getShopStore().getCheckout(sessionId, id) : null;
  return <PageContainer className="max-w-3xl">
    <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
    {draft ? <>
      <p>Reservation expires at {new Date(draft.expiresAt).toLocaleTimeString("en-GB", { timeZone: "Europe/London" })} (UK time).</p>
      <ul className="mb-6 divide-y">{draft.quote.lines.map(line => <li key={line.variantId} className="py-3">
        {line.title} — {line.variantLabel} × {line.quantity}
        <span className="float-right">{formatMoney(line.total, draft.quote.currency)}</span>
      </li>)}</ul>
      <p>Delivery: {formatMoney(draft.quote.delivery, draft.quote.currency)}</p>
      <p className="my-4 text-xl font-bold">Total: {formatMoney(draft.quote.total, draft.quote.currency)}</p>
      <CheckoutForm key={draft.id} checkoutId={draft.id} />
      <Link href="/checkout" className="mt-4 block underline">Start a new checkout</Link>
    </> : <>{id && <p>Your reservation expired or was replaced. Start checkout again to reserve your items.</p>}<StartCheckout /></>}
    <Link href="/basket" className="mt-6 block underline">Return to basket</Link>
  </PageContainer>;
}
