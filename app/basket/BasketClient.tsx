"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { formatGBP } from "@/utils/money";
import DeliverySelect from "@/components/DeliverySelect";
import { useShop } from "@/app/ShopProvider";

type Props = {
  products: Product[];
};

export default function BasketClient({ products }: Props) {
  const { basket, setQty } = useShop();

  const items = Object.entries(basket)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === Number(id));
      return product ? { product, qty } : null;
    })
    .filter((item): item is { product: Product; qty: number } => item !== null);

  const deliveryOptions = [
    { id: "standard", name: "Standard delivery", price: 3.5 },
    { id: "free-standard", name: "FREE standard delivery", price: 0 },
    { id: "premium", name: "Premium delivery", price: 4.5 },
    { id: "next-day", name: "Next day delivery", price: 5 },
  ];

  const [deliveryOption, setDeliveryOption] = useState("");
  const freeDeliveryThreshold = 100;

  const selectedOption = deliveryOptions.find(
    (option) => option.id === deliveryOption
  );

  const total = items.reduce((t, { product, qty }) => t + product.price * qty, 0);
  const isFreeDelivery = total >= freeDeliveryThreshold;

  useEffect(() => {
    if (deliveryOption.includes("standard")) {
      setDeliveryOption("");
    }
  }, [isFreeDelivery, deliveryOption]);

  useEffect(() => {
    if (Object.keys(basket).length === 0) {
      setDeliveryOption("");
    }
  }, [basket]);

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
      <h1 className="text-xl font-bold mb-8">Basket</h1>
      <Link href="/products">← Continue shopping</Link>

      {items.length === 0 ? (
        <p>Your basket is empty.</p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_420px] lg:items-start">
          <div className="grid gap-3">
            {items.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border border-gray-300 p-3"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-[60px] w-[60px] object-contain"
                />

                <div className="flex-1">
                  <div className="font-bold">
                    <Link href={`/products/${product.id}`}>{product.title}</Link>
                  </div>
                  <div>{formatGBP(product.price)}</div>
                </div>

                <div className="ml-auto flex items-center gap-4">
                  <p className="min-w-[80px] text-right font-semibold">
                    {formatGBP(product.price * qty)}
                  </p>

                  <div className="flex items-center">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-md border border-gray-300 text-lg transition hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="flex h-10 min-w-[44px] items-center justify-center border-y border-gray-300 px-3">
                      {qty}
                    </span>

                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-md border border-gray-300 text-lg transition hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => setQty(product.id, 0)}
                    className="cursor-pointer text-sm underline underline-offset-2 transition hover:no-underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-lg border border-gray-300 p-4 lg:sticky lg:top-6">
            <h2 className="mb-4 text-xl font-bold">Order summary</h2>

            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sub-total</span>
                <span className="font-semibold">{formatGBP(total)}</span>
              </div>

              <div className="mb-4">
                <label htmlFor="delivery" className="mb-2 block font-medium">
                  Delivery
                </label>

                <DeliverySelect
                  deliveryOptions={deliveryOptions}
                  value={deliveryOption}
                  onChange={setDeliveryOption}
                  isFreeDelivery={isFreeDelivery}
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {selectedOption
                    ? formatGBP(total + selectedOption.price)
                    : formatGBP(total)}
                </span>
              </div>
            </div>

            <button
              onClick={() => alert("Begin payment process")}
              disabled={!selectedOption}
              className={`h-14 w-full rounded-md text-lg font-semibold transition ${
                selectedOption
                  ? "cursor-pointer bg-black text-white hover:bg-gray-800"
                  : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              Checkout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}