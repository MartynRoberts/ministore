"use client";

import Link from "next/link";
import { useShop } from "@/app/ShopProvider";
import { MAX_QUANTITY, type DeliveryMethod } from "@/lib/basket";
import { formatMoney } from "@/lib/money";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormControls";
import { Card, PageContainer, StatusMessage } from "@/components/ui/Layout";
import { ChevronIcon } from "@/components/ui/ChevronIcon";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import CheckoutButton from "./CheckoutButton";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";
import Image from "next/image";

export default function BasketClient({ recommendations }: { recommendations: Product[] }) {
  const { basket, favs, setQty, setDelivery, addToBasket, toggleFav, pending } = useShop();
  const money = (value: number) => formatMoney(value, basket.currency);
  return <PageContainer>
    <div className="mb-8 flex items-center gap-3">
      <h1 className="text-xl font-bold">Basket</h1>
      <LoadingIndicator active={pending} label="Updating basket" />
    </div>
    {!basket.lines.length ? <>
      <section className="rounded-lg border border-border bg-surface px-5 py-10 text-center sm:px-8 sm:py-14">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h2l1.7 9.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L20 8H6M9 20h.01M17 20h.01" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-bold">Your basket is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-text-muted">Explore the latest products and add something you like. Your basket will be saved for this session.</p>
        <Link href="/products" className={buttonStyles({ size: "lg", className: "mt-6" })}>Start shopping</Link>
      </section>

      {recommendations.length > 0 && <section className="mt-12" aria-labelledby="basket-recommendations-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><h2 id="basket-recommendations-heading" className="text-2xl font-bold">You might also like</h2><p className="mt-1 text-text-muted">Popular picks from Mini Store</p></div>
          <Link href="/products" className="shrink-0 font-semibold underline hover:no-underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((product, index) => <ProductCard key={product.id} product={product} preloadImage={index === 0} isFav={favs.includes(product.id)} onToggleFav={toggleFav} onAddToBasket={addToBasket} />)}
        </div>
      </section>}
    </> : <>
    <Link href="/products" className="inline-flex items-center gap-2"><ChevronIcon className="h-4 w-4" />Continue shopping</Link>
    <div className="mt-6 grid gap-8 lg:grid-cols-3">
      <fieldset disabled={pending} className="grid gap-3 lg:col-span-2">
        {basket.lines.map(line => <Card key={line.variantId} className="grid grid-cols-[60px_minmax(0,1fr)] gap-x-4 gap-y-3 p-3 lg:grid-cols-12 lg:items-center lg:gap-x-3">
          <div className="row-start-1 flex h-[60px] w-[60px] items-center justify-center self-start lg:col-span-1 lg:col-start-1 lg:self-center lg:justify-self-center">
            {line.image && <Image src={line.image} alt="" width={60} height={60} className="max-h-full max-w-full object-contain" />}
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
    </div></>}
  </PageContainer>;
}
