import type { BasketQuote } from "@/lib/basket";
import { formatMoney } from "@/lib/money";
import Link from "next/link";
import Image from "next/image";

const deliveryNames = { standard: "Standard delivery", premium: "Premium delivery", "next-day": "Next-day delivery" };

export default function OrderSummary({ quote, headingId = "order-summary-heading", className = "" }: { quote: BasketQuote; headingId?: string; className?: string }) {
  const money = (value: number) => formatMoney(value, quote.currency);
  return <aside className={`rounded-lg border border-border bg-surface p-4 sm:p-6 ${className}`} aria-labelledby={headingId}>
    <h2 id={headingId} className="mb-4 text-xl font-bold">Order summary</h2>
    <ul className="divide-y divide-border">
      {quote.lines.map(line => <li key={line.variantId} className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 py-4 first:pt-0 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-surface-muted p-1 sm:h-16 sm:w-16">{line.image && <Image src={line.image} alt="" width={64} height={64} className="max-h-full max-w-full object-contain" />}</div>
        <div className="min-w-0"><Link href={`/products/${line.productId}`} className="font-semibold leading-snug hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">{line.title}</Link><p className="text-sm text-text-muted">{line.variantLabel} · Qty {line.quantity}</p></div>
        <p className="col-start-2 justify-self-end font-semibold sm:col-start-3 sm:row-start-1">{money(line.total)}</p>
      </li>)}
    </ul>
    <dl className="mt-2 grid gap-3 border-t border-border pt-4">
      <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{money(quote.subtotal)}</dd></div>
      <div className="flex justify-between gap-4"><dt><span className="block">{deliveryNames[quote.deliveryMethod]}</span><span className="text-sm text-text-muted">Selected delivery method</span></dt><dd>{quote.delivery === 0 ? "Free" : money(quote.delivery)}</dd></div>
      <div className="flex justify-between gap-4 border-t border-border pt-4 text-lg font-bold"><dt>Total</dt><dd>{money(quote.total)}</dd></div>
    </dl>
  </aside>;
}
