"use client";

import { useActionState } from "react";
import { placeOrder } from "@/app/actions/checkout";

export default function CheckoutForm({ checkoutId }: { checkoutId: string }) {
  const [state, action, pending] = useActionState(placeOrder, {});
  return <form action={action} className="mt-8 grid gap-4">
    <input type="hidden" name="checkoutId" value={checkoutId} />
    <h2 className="text-xl font-bold">Delivery details</h2>
    <fieldset disabled={pending} className="grid gap-4">
      <label>Full name<input required name="name" autoComplete="name" maxLength={100} className="mt-1 block w-full border p-2" /></label>
      <label>Email<input required type="email" name="email" autoComplete="email" maxLength={254} className="mt-1 block w-full border p-2" /></label>
      <label>Address<input required name="address" autoComplete="street-address" maxLength={200} className="mt-1 block w-full border p-2" /></label>
      <label>Town or city<input required name="city" autoComplete="address-level2" maxLength={100} className="mt-1 block w-full border p-2" /></label>
      <label>UK postcode<input required name="postcode" autoComplete="postal-code" maxLength={12} className="mt-1 block w-full border p-2" /></label>
      <h2 className="text-xl font-bold">Demo payment</h2>
      <p>No money will be charged and no items will be shipped. Do not enter card details.</p>
      <label>Simulated outcome<select name="payment" defaultValue="approve" className="mt-1 block w-full border p-2">
        <option value="approve">Payment approved</option>
        <option value="decline">Payment declined</option>
        <option value="pending">Leave payment pending</option>
      </select></label>
      <button type="submit" className="rounded bg-black p-4 font-semibold text-white disabled:opacity-50">{pending ? "Placing order…" : "Place demo order"}</button>
    </fieldset>
    {state.error && <p role="alert" className="text-red-700">{state.error}</p>}
  </form>;
}
