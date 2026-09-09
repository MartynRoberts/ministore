"use client";

import { useActionState, useState } from "react";
import { updateInventory } from "@/app/actions/orders";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormControls";
import { StatusMessage } from "@/components/ui/Layout";

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
        <TextInput
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
          className="w-24"
        />
        <Button type="submit" size="sm">
          {pending ? "Saving…" : "Save"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStock("0")}>
          Sold out
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setStock("3")}>
          Low stock
        </Button>
      </fieldset>
      {state.error && <StatusMessage role="alert" className="text-sm">{state.error}</StatusMessage>}
      {state.success && <StatusMessage role="status" tone="success" className="text-sm">{state.success}</StatusMessage>}
    </form>
  );
}
