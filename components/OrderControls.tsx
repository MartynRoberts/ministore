"use client";
import { useActionState } from "react";
import { cancelOrder, updateOrder } from "@/app/actions/orders";
import { orderTransitions, type OrderStatus } from "@/lib/order-status";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormControls";
import { StatusMessage } from "@/components/ui/Layout";
export default function OrderControls({ id, status, admin = false }: { id: string; status: OrderStatus; admin?: boolean }) {
  const [state, action, pending] = useActionState(admin ? updateOrder : cancelOrder, {});
  const options = orderTransitions[status];
  if (!options.length) return null;
  return <form action={action} className="my-4 space-y-2">
    <input type="hidden" name="id" value={id} /><input type="hidden" name="expected" value={status} />
    <fieldset disabled={pending} className="flex flex-wrap gap-3">
      {admin && <Select name="status" aria-label="Next order status" className="w-auto">{options.map(next => <option key={next} value={next}>{next}</option>)}</Select>}
      <Button type="submit" loading={pending} loadingLabel="Updating order" variant={admin ? "primary" : "secondary"}>{admin ? "Update order" : "Cancel order"}</Button>
    </fieldset>
    {state.error && <StatusMessage role="alert">{state.error}</StatusMessage>}
    {state.success && <StatusMessage role="status" tone="success">{state.success}</StatusMessage>}
  </form>;
}
