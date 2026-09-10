import OrderControls from "@/components/OrderControls";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { Card, PageContainer } from "@/components/ui/Layout";
import { notFound } from "next/navigation";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import OrderSummary from "@/components/OrderSummary";

const statusNames = { pending: "Payment pending", paid: "Order confirmed", processing: "Preparing your order", shipped: "Order shipped", cancelled: "Order cancelled" };
const paymentNames = { "simulated-paid": "Demo payment approved", "simulated-pending": "Demo payment pending", "simulated-refunded": "Demo payment refunded", "simulated-cancelled": "Demo payment cancelled" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(new Date(value));
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) notFound();
  const { id } = await params;
  const order = getShopStore().getOrder(sessionId, id);
  if (!order) notFound();

  const status = order.status ?? "pending";
  const isCancelled = status === "cancelled";
  const isPending = order.paymentStatus === "simulated-pending";
  const heading = isCancelled ? "Order cancelled" : isPending ? "Order received" : "Order confirmed";

  return <PageContainer>
    <section className={`mb-8 rounded-lg border p-5 sm:p-6 ${isCancelled ? "border-danger bg-surface" : isPending ? "border-warning bg-surface-muted" : "border-success bg-surface"}`}>
      <div className="flex gap-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${isCancelled ? "bg-danger" : isPending ? "bg-warning" : "bg-success"}`}>
          {isCancelled ? <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="m7 7 10 10M17 7 7 17"/></svg>
            : isPending ? <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/></svg>
            : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="m6 12 4 4 8-8"/></svg>}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{heading}</h1>
          <p className="mt-1">{isCancelled ? "This demo order will not be fulfilled." : isPending ? "The simulated payment is pending. You can follow its progress below." : `Thanks, ${order.customer.name}. Your demo order has been placed.`}</p>
          <p className="mt-3 text-sm text-text-muted">No real payment was taken and no items will be shipped.</p>
        </div>
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-sm text-text-muted">Order reference</p>
        <p className="break-all font-mono text-sm font-semibold">{order.id}</p>
      </div>
    </section>

    <div className="grid items-start gap-8 lg:grid-cols-5">
      <div className="grid gap-6 lg:col-span-3">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-sm text-text-muted">Current status</p><h2 className="mt-1 text-xl font-bold">{statusNames[status]}</h2><p className="mt-1 text-sm text-text-muted">{paymentNames[order.paymentStatus]}</p></div>
            <OrderControls id={order.id} status={status} />
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold">Delivery details</h2>
          <address className="not-italic leading-7">
            <p className="font-semibold">{order.customer.name}</p><p>{order.customer.address}</p><p>{order.customer.city}</p><p>{order.customer.postcode}</p>
            <p className="mt-2"><a href={`mailto:${order.customer.email}`} className="underline">{order.customer.email}</a></p>
          </address>
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="mb-5 text-xl font-bold">Order progress</h2>
          <ol className="grid gap-0">
            {(order.events ?? []).map((event, index, events) => <li key={`${event.status}-${event.at}`} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center"><span className={`mt-1 h-3 w-3 rounded-full ${event.status === "cancelled" ? "bg-danger" : "bg-primary"}`} />{index < events.length - 1 && <span className="min-h-10 w-px flex-1 bg-border" />}</div>
              <div className="pb-5"><p className="font-semibold">{statusNames[event.status]}</p><p className="text-sm text-text-muted">{formatDate(event.at)}</p>{event.note && <p className="mt-1 text-sm">{event.note}</p>}</div>
            </li>)}
          </ol>
        </Card>
      </div>

      <OrderSummary quote={order.quote} className="lg:sticky lg:top-32 lg:col-span-2" />
    </div>

    <nav aria-label="Order actions" className="mt-8 flex flex-wrap gap-3">
      <Link href="/products" className={buttonStyles()}>Continue shopping</Link>
      <Link href="/orders" className={buttonStyles({ variant: "secondary" })}>View all orders</Link>
    </nav>
  </PageContainer>;
}
