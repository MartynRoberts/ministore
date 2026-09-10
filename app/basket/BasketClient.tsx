"use client";

import Link from "next/link";
import { useShop } from "@/app/ShopProvider";
import { MAX_QUANTITY, type DeliveryMethod } from "@/lib/basket";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormControls";
import { Card, PageContainer, StatusMessage } from "@/components/ui/Layout";
import { ChevronIcon } from "@/components/ui/ChevronIcon";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import CheckoutButton from "./CheckoutButton";

export default function BasketClient() {
  const { basket, setQty, setDelivery, pending } = useShop();
  const money = (value: number) => formatMoney(value, basket.currency);
  return <PageContainer>
    <div className="mb-8 flex items-center gap-3">
      <h1 className="text-xl font-bold">Basket</h1>
      <LoadingIndicator active={pending} label="Updating basket" />
    </div>
    <Link href="/products" className="inline-flex items-center gap-2"><ChevronIcon className="h-4 w-4" />Continue shopping</Link>
    {!basket.lines.length ? <p>Your basket is empty.</p> : <div className="mt-6 grid gap-8 lg:grid-cols-3">
      <fieldset disabled={pending} className="grid gap-3 lg:col-span-2">
        {basket.lines.map(line => <Card key={line.variantId} className="grid grid-cols-[60px_minmax(0,1fr)] gap-x-4 gap-y-3 p-3 lg:grid-cols-12 lg:items-center lg:gap-x-3">
          <div className="row-start-1 flex h-[60px] w-[60px] items-center justify-center self-start lg:col-span-1 lg:col-start-1 lg:self-center lg:justify-self-center">
            {line.image && <img src={line.image} alt="" className="max-h-full max-w-full object-contain" />}
          </div>
          <div className="col-start-2 row-start-1 min-w-0 lg:col-span-4 lg:col-start-2">
            <Link href={`/products/${line.productId}`} className="font-bold">{line.title}</Link>
            <p>{line.variantLabel}</p>
            <p className="hidden lg:block">{money(line.unitPrice)}</p>
            {!line.available && <StatusMessage>This option is unavailable. Please remove it.</StatusMessage>}
          </div>
          <div className="col-span-2 row-start-2 flex items-end justify-between gap-2 max-[400px]:flex-col max-[400px]:items-stretch lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:self-center">
            <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
              <Button variant="secondary" size="icon" aria-label={`Decrease quantity of ${line.title}, ${line.variantLabel}`} onClick={() => setQty(line.variantId, line.quantity - 1)} className="h-10 w-10">−</Button>
              <span className="min-w-5 text-center">{line.quantity}</span>
              <Button variant="secondary" size="icon" aria-label={`Increase quantity of ${line.title}, ${line.variantLabel}`} disabled={!line.available || line.quantity >= MAX_QUANTITY} onClick={() => setQty(line.variantId, line.quantity + 1)} className="h-10 w-10">+</Button>
              <Button variant="ghost" size="sm" onClick={() => setQty(line.variantId, 0)} className="px-2 sm:px-3">Remove</Button>
            </div>
            <div className="shrink-0 text-right max-[400px]:self-end">
              <p className="font-semibold">{money(line.total)}</p>
              <p className="whitespace-nowrap text-xs text-text-muted lg:hidden">Unit price {money(line.unitPrice)}</p>
            </div>
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
        <CheckoutButton disabled={!basket.canCheckout || pending} />
      </aside>
    </div>}
  </PageContainer>;
}
