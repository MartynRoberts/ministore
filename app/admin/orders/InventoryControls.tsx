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
    <form action={action} className="w-full min-w-0 space-y-2 md:min-w-[260px]">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="expectedStock" value={initialStock} />
      <label htmlFor={`stock-${productId}`} className="sr-only">
        On-hand stock for {title}
      </label>
      <fieldset disabled={pending} className="space-y-2">
        <div className="flex gap-2">
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
            className="min-w-0 flex-1"
          />
          <Button type="submit" loading={pending} loadingLabel={`Saving stock for ${title}`} className="shrink-0">Save</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button className="w-full" variant="secondary" onClick={() => setStock("0")}>
            Set sold out
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => setStock("3")}>
            Set low stock
          </Button>
        </div>
      </fieldset>
      {state.error && <StatusMessage role="alert" className="text-sm">{state.error}</StatusMessage>}
      {state.success && <StatusMessage role="status" tone="success" className="text-sm">{state.success}</StatusMessage>}
    </form>
  );
}
