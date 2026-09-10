"use client";

import { useActionState } from "react";
import { placeOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/FormControls";
import { StatusMessage } from "@/components/ui/Layout";

export default function CheckoutForm({ checkoutId }: { checkoutId: string }) {
  const [state, action, pending] = useActionState(placeOrder, {});
  return <form action={action} className="mt-8 grid gap-4">
    <input type="hidden" name="checkoutId" value={checkoutId} />
    <h2 className="text-xl font-bold">Delivery details</h2>
    <fieldset disabled={pending} className="grid gap-4">
      <label>Full name<TextInput required name="name" autoComplete="name" maxLength={100} className="mt-1" /></label>
      <label>Email<TextInput required type="email" name="email" autoComplete="email" maxLength={254} className="mt-1" /></label>
      <label>Address<TextInput required name="address" autoComplete="street-address" maxLength={200} className="mt-1" /></label>
      <label>Town or city<TextInput required name="city" autoComplete="address-level2" maxLength={100} className="mt-1" /></label>
      <label>UK postcode<TextInput required name="postcode" autoComplete="postal-code" maxLength={12} className="mt-1" /></label>
      <h2 className="text-xl font-bold">Demo payment</h2>
      <p>No money will be charged and no items will be shipped. Do not enter card details.</p>
      <label>Simulated outcome<Select name="payment" defaultValue="approve" className="mt-1 w-full">
        <option value="approve">Payment approved</option>
        <option value="decline">Payment declined</option>
        <option value="pending">Leave payment pending</option>
      </Select></label>
      <Button type="submit" loading={pending} loadingLabel="Placing order" size="lg">Place demo order</Button>
    </fieldset>
    {state.error && <StatusMessage role="alert">{state.error}</StatusMessage>}
  </form>;
}
