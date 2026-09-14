import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "@/components/OrderSummary";
import { buttonStyles } from "@/components/ui/Button";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const sessionId = await getCurrentSessionId();
  const { id } = await searchParams;
  const draft = sessionId && id ? await getShopStore().getCheckout(sessionId, id) : null;
  if (!draft) return <PageContainer>
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-warning bg-surface lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-surface-muted px-6 py-10 text-center sm:px-10 sm:py-14 lg:min-h-[32rem]">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning text-on-primary">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5m0 4h.01"/></svg>
        </span>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">No active stock reservation</h1>
        <p className="mx-auto mt-3 max-w-md text-text-muted">{id ? "This reservation has expired or was replaced by a newer checkout." : "Checkout needs to begin from your basket so we can verify availability and reserve your items."}</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
        <div className="grid gap-4 text-left">
          <div className="rounded-md border border-border p-4"><p className="font-semibold">Your basket is safe</p><p className="mt-1 text-sm text-text-muted">Your products and delivery choice remain in your basket.</p></div>
          <div className="rounded-md border border-border p-4"><p className="font-semibold">Stock is checked again</p><p className="mt-1 text-sm text-text-muted">Continuing from the basket creates a fresh 15-minute reservation.</p></div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/basket" className={buttonStyles({ size: "lg", className: "w-full" })}>Return to basket</Link>
          <Link href="/products" className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}>Continue shopping</Link>
        </div>
      </div>
    </section>
  </PageContainer>;

  return <PageContainer>
    <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
    <>
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
    </>
  </PageContainer>;
}
