"use client";

import { useActionState, useState } from "react";
import { updateInventory } from "@/app/actions/orders";

export default function InventoryControls({
  productId,
  title,
  stock: initialStock,
}: {
  productId: number;
  title: string;
  stock: number;
}) {
  const [state, action, pending] = useActionState(updateInventory, {});
  const [stock, setStock] = useState(String(initialStock));

  return (
    <form action={action} className="min-w-[260px] space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="expectedStock" value={initialStock} />
      <label htmlFor={`stock-${productId}`} className="sr-only">
        On-hand stock for {title}
      </label>
      <fieldset disabled={pending} className="flex flex-wrap gap-2">
        <input
          id={`stock-${productId}`}
          name="stock"
          type="number"
          inputMode="numeric"
          min={0}
          max={9999}
          step={1}
          required
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          className="w-24 rounded border p-2"
        />
        <button className="rounded border px-3 py-2 font-medium">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setStock("0")} className="rounded border px-2 py-1 text-sm">
          Sold out
        </button>
        <button type="button" onClick={() => setStock("3")} className="rounded border px-2 py-1 text-sm">
          Low stock
        </button>
      </fieldset>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
    </form>
  );
}
