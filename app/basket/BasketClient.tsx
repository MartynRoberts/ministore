"use client";

import Link from "next/link";
import { useShop } from "@/app/ShopProvider";
import { MAX_QUANTITY, type DeliveryMethod } from "@/lib/basket";
import { formatMoney } from "@/lib/money";

export default function BasketClient() {
  const { basket, setQty, setDelivery, pending } = useShop();
  const money = (value: number) => formatMoney(value, basket.currency);
  return <div className="mx-auto my-16 w-full max-w-[1680px] px-4">
    <h1 className="mb-8 text-xl font-bold">Basket</h1>
    <Link href="/products">← Continue shopping</Link>
    {pending && <p role="status">Updating basket…</p>}
    {!basket.lines.length ? <p>Your basket is empty.</p> : <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_420px]">
      <fieldset disabled={pending} className="grid gap-3">
        {basket.lines.map(line => <div key={line.variantId} className="flex flex-wrap items-center gap-3 border border-gray-300 p-3">
          {line.image && <img src={line.image} alt="" className="h-[60px] w-[60px] object-contain" />}
          <div className="flex-1">
            <Link href={`/products/${line.productId}`} className="font-bold">{line.title}</Link>
            <p>{line.variantLabel}</p>
            <p>{money(line.unitPrice)}</p>
            {!line.available && <p className="text-red-700">This option is unavailable. Please remove it.</p>}
          </div>
          <p className="font-semibold">{money(line.total)}</p>
          <div className="flex items-center gap-3">
            <button aria-label={`Decrease quantity of ${line.title}, ${line.variantLabel}`} onClick={() => setQty(line.variantId, line.quantity - 1)} className="h-10 w-10 border">−</button>
            <span>{line.quantity}</span>
            <button aria-label={`Increase quantity of ${line.title}, ${line.variantLabel}`} disabled={!line.available || line.quantity >= MAX_QUANTITY} onClick={() => setQty(line.variantId, line.quantity + 1)} className="h-10 w-10 border disabled:opacity-40">+</button>
            <button onClick={() => setQty(line.variantId, 0)} className="underline">Remove</button>
          </div>
        </div>)}
      </fieldset>
      <aside className="rounded-lg border border-gray-300 p-4">
        <h2 className="mb-4 text-xl font-bold">Order summary</h2>
        <p className="mb-4 flex justify-between"><span>Subtotal</span><span>{money(basket.subtotal)}</span></p>
        <label htmlFor="delivery" className="mb-2 block">Delivery</label>
        <select id="delivery" disabled={pending} value={basket.deliveryMethod} onChange={event => setDelivery(event.target.value as DeliveryMethod)} className="mb-4 w-full border p-3">
          <option value="standard">Standard — {basket.subtotal >= 10000 ? "Free" : money(350)}</option>
          <option value="premium">Premium — {money(450)}</option>
          <option value="next-day">Next day — {money(500)}</option>
        </select>
        <p className="mb-4 flex justify-between"><span>Delivery</span><span>{money(basket.delivery)}</span></p>
        <p className="mb-4 flex justify-between border-t pt-4 font-bold"><span>Total</span><span>{money(basket.total)}</span></p>
        {basket.canCheckout && !pending ? <Link href="/checkout" className="block rounded bg-black p-4 text-center font-semibold text-white">Review checkout</Link> : <button disabled className="w-full rounded bg-gray-200 p-4">Review checkout</button>}
      </aside>
    </div>}
  </div>;
}
