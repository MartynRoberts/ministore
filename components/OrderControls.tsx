"use client";
import { useActionState } from "react";
import { cancelOrder, updateOrder } from "@/app/actions/orders";
import { orderTransitions, type OrderStatus } from "@/lib/order-status";
export default function OrderControls({ id, status, admin = false }: { id: string; status: OrderStatus; admin?: boolean }) {
  const [state, action, pending] = useActionState(admin ? updateOrder : cancelOrder, {});
  const options = orderTransitions[status];
  if (!options.length) return null;
  return <form action={action} className="my-4 space-y-2">
    <input type="hidden" name="id" value={id} /><input type="hidden" name="expected" value={status} />
    <fieldset disabled={pending} className="flex flex-wrap gap-3">
      {admin && <select name="status" aria-label="Next order status" className="border p-2">{options.map(next => <option key={next} value={next}>{next}</option>)}</select>}
      <button className="rounded border p-2">{pending ? "Updating…" : admin ? "Update order" : "Cancel order"}</button>
    </fieldset>
    {state.error && <p role="alert" className="text-red-700">{state.error}</p>}
    {state.success && <p role="status">{state.success}</p>}
  </form>;
}
