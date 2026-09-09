"use client";

import Link from "next/link";
import { useShop } from "@/app/ShopProvider";
import { MAX_QUANTITY, type DeliveryMethod } from "@/lib/basket";
import { formatMoney } from "@/lib/money";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormControls";
import { Card, PageContainer, StatusMessage } from "@/components/ui/Layout";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

export default function BasketClient() {
  const { basket, setQty, setDelivery, pending } = useShop();
  const money = (value: number) => formatMoney(value, basket.currency);
  return <PageContainer>
    <h1 className="mb-8 text-xl font-bold">Basket</h1>
    <Link href="/products" className="inline-flex items-center gap-2"><ChevronIcon className="h-4 w-4" />Continue shopping</Link>
    {pending && <p role="status">Updating basket…</p>}
    {!basket.lines.length ? <p>Your basket is empty.</p> : <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_420px]">
      <fieldset disabled={pending} className="grid gap-3">
        {basket.lines.map(line => <Card key={line.variantId} className="flex flex-wrap items-center gap-3 p-3">
          {line.image && <img src={line.image} alt="" className="h-[60px] w-[60px] object-contain" />}
          <div className="flex-1">
            <Link href={`/products/${line.productId}`} className="font-bold">{line.title}</Link>
            <p>{line.variantLabel}</p>
            <p>{money(line.unitPrice)}</p>
            {!line.available && <StatusMessage>This option is unavailable. Please remove it.</StatusMessage>}
          </div>
          <p className="font-semibold">{money(line.total)}</p>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" aria-label={`Decrease quantity of ${line.title}, ${line.variantLabel}`} onClick={() => setQty(line.variantId, line.quantity - 1)} className="h-10 w-10">−</Button>
            <span>{line.quantity}</span>
            <Button variant="secondary" size="icon" aria-label={`Increase quantity of ${line.title}, ${line.variantLabel}`} disabled={!line.available || line.quantity >= MAX_QUANTITY} onClick={() => setQty(line.variantId, line.quantity + 1)} className="h-10 w-10">+</Button>
            <Button variant="ghost" size="sm" onClick={() => setQty(line.variantId, 0)}>Remove</Button>
          </div>
        </Card>)}
      </fieldset>
      <aside className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-4 text-xl font-bold">Order summary</h2>
        <p className="mb-4 flex justify-between"><span>Subtotal</span><span>{money(basket.subtotal)}</span></p>
        <label htmlFor="delivery" className="mb-2 block">Delivery</label>
        <Select id="delivery" disabled={pending} value={basket.deliveryMethod} onChange={event => setDelivery(event.target.value as DeliveryMethod)} className="mb-4 w-full">
          <option value="standard">Standard — {basket.subtotal >= 10000 ? "Free" : money(350)}</option>
          <option value="premium">Premium — {money(450)}</option>
          <option value="next-day">Next day — {money(500)}</option>
        </Select>
        <p className="mb-4 flex justify-between"><span>Delivery</span><span>{money(basket.delivery)}</span></p>
        <p className="mb-4 flex justify-between border-t pt-4 font-bold"><span>Total</span><span>{money(basket.total)}</span></p>
        {basket.canCheckout && !pending ? <Link href="/checkout" className={buttonStyles({ size: "lg", className: "w-full" })}>Review checkout</Link> : <Button disabled size="lg" className="w-full">Review checkout</Button>}
      </aside>
    </div>}
  </PageContainer>;
}
