import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import { formatMoney } from "@/lib/money";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) notFound();
  const { id } = await params;
  const order = getShopStore().getOrder(sessionId, id);
  if (!order) notFound();
  return <div className="mx-auto my-16 max-w-3xl px-4">
    <h1 className="mb-4 text-2xl font-bold">Your demo order is confirmed</h1>
    <p>Simulated payment approved. No money was charged and no items will be shipped.</p>
    <p className="my-4 break-all">Order reference: {order.id}</p>
    <ul className="divide-y">{order.quote.lines.map(line => <li key={line.variantId} className="py-3">
      {line.title} — {line.variantLabel} × {line.quantity}
      <span className="float-right">{formatMoney(line.total, order.quote.currency)}</span>
    </li>)}</ul>
    <p className="mt-4">Delivery: {formatMoney(order.quote.delivery, order.quote.currency)}</p>
    <p className="my-4 text-xl font-bold">Total: {formatMoney(order.quote.total, order.quote.currency)}</p>
    <h2 className="font-bold">Delivery details</h2>
    <p>{order.customer.name}</p><p>{order.customer.address}</p><p>{order.customer.city}, {order.customer.postcode}</p>
    <Link href="/products" className="mt-6 block underline">Continue shopping</Link>
  </div>;
}
