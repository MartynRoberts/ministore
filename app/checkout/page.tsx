import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import { formatMoney } from "@/lib/money";
import CheckoutForm from "./CheckoutForm";

const deliveryNames = {
  standard: "Standard delivery",
  premium: "Premium delivery",
  "next-day": "Next-day delivery",
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sessionId = await getCurrentSessionId();
  const { id } = await searchParams;
  const draft = sessionId && id ? getShopStore().getCheckout(sessionId, id) : null;
  const money = (value: number) => formatMoney(value, draft?.quote.currency ?? "GBP");

  return <PageContainer>
    <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
    {!draft ? (
      <div className="max-w-xl rounded-lg border border-warning bg-surface p-5">
        <h2 className="font-bold">No active stock reservation</h2>
        <p className="mt-2 text-text-muted">{id ? "Your reservation has expired or was replaced." : "Start checkout from your basket so we can reserve your items."}</p>
        <Link href="/basket" className="mt-4 inline-block font-semibold underline">Return to basket</Link>
      </div>
    ) : <>
      <div role="status" className="mb-6 flex gap-3 rounded-lg border border-warning bg-surface-muted p-4">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-6 w-6 shrink-0 text-warning" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/>
        </svg>
        <div>
          <p className="font-bold">Your stock is reserved for 15 minutes</p>
          <p className="text-sm text-text-muted">Complete your order before {new Date(draft.expiresAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" })} UK time.</p>
        </div>
      </div>

      <CheckoutForm key={draft.id} checkoutId={draft.id} orderSummary={
        <aside className="rounded-lg border border-border bg-surface p-4 sm:p-6" aria-labelledby="order-summary-heading">
          <h2 id="order-summary-heading" className="mb-4 text-xl font-bold">Order summary</h2>
          <ul className="divide-y divide-border">
            {draft.quote.lines.map(line => <li key={line.variantId} className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 py-4 first:pt-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-surface-muted p-1">
                {line.image && <img src={line.image} alt="" className="max-h-full max-w-full object-contain" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{line.title}</p>
                <p className="text-sm text-text-muted">{line.variantLabel} · Qty {line.quantity}</p>
              </div>
              <p className="font-semibold">{money(line.total)}</p>
            </li>)}
          </ul>
          <dl className="mt-2 grid gap-3 border-t border-border pt-4">
            <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{money(draft.quote.subtotal)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt><span className="block">{deliveryNames[draft.quote.deliveryMethod]}</span><span className="text-sm text-text-muted">Selected delivery method</span></dt>
              <dd>{draft.quote.delivery === 0 ? "Free" : money(draft.quote.delivery)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-4 text-lg font-bold"><dt>Total</dt><dd>{money(draft.quote.total)}</dd></div>
          </dl>
        </aside>
      } />
      <Link href="/basket" className="mt-6 inline-block underline">Return to basket</Link>
    </>}
  </PageContainer>;
}
