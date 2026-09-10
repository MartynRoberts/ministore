import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "@/components/OrderSummary";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sessionId = await getCurrentSessionId();
  const { id } = await searchParams;
  const draft = sessionId && id ? getShopStore().getCheckout(sessionId, id) : null;
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

      <CheckoutForm key={draft.id} checkoutId={draft.id} orderSummary={<OrderSummary quote={draft.quote} />} />
      <Link href="/basket" className="mt-6 inline-block underline">Return to basket</Link>
    </>}
  </PageContainer>;
}
