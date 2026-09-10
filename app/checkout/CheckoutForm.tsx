"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import { placeOrder } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/FormControls";
import { StatusMessage } from "@/components/ui/Layout";
import type { CheckoutState, CustomerField } from "@/lib/checkout";
import { trackEvent } from "@/lib/analytics";

function DeliveryField({ name, label, type = "text", autoComplete, minLength, maxLength, inputMode, pattern, help, state }: {
  name: CustomerField;
  label: string;
  type?: "text" | "email";
  autoComplete: string;
  minLength: number;
  maxLength: number;
  inputMode?: "email" | "text";
  pattern?: string;
  help?: string;
  state: CheckoutState;
}) {
  const error = state.fieldErrors?.[name];
  const descriptionId = `${name}-${error ? "error" : "help"}`;
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-medium">{label} <span aria-hidden="true" className="text-danger">*</span></label>
      <TextInput
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        aria-invalid={Boolean(error)}
        aria-describedby={(error || help) ? descriptionId : undefined}
        className={error ? "border-danger focus:border-danger focus:ring-danger" : ""}
      />
      {error ? <StatusMessage id={descriptionId} role="alert" className="mt-1 text-sm">{error}</StatusMessage> : help ? <p id={descriptionId} className="mt-1 text-sm text-text-muted">{help}</p> : null}
    </div>
  );
}

function PaymentIcons() {
  return (
    <div role="img" className="flex flex-wrap items-center gap-2" aria-label="Example accepted payment methods: Visa, Mastercard, American Express, PayPal, and Apple Pay">
      <span className="inline-flex h-9 min-w-14 items-center justify-center rounded-md border border-border bg-surface px-2 text-base font-black italic text-[#1434CB] shadow-sm">VISA</span>
      <span className="inline-flex h-9 min-w-14 items-center justify-center rounded-md border border-border bg-surface px-1 shadow-sm">
        <svg aria-hidden="true" viewBox="0 0 44 28" className="h-6 w-10"><circle cx="16" cy="14" r="10" fill="#EB001B"/><circle cx="28" cy="14" r="10" fill="#F79E1B" fillOpacity=".9"/></svg>
      </span>
      <span className="inline-flex h-9 min-w-14 items-center justify-center rounded-md border border-border bg-[#2E77BC] px-2 text-xs font-bold text-white shadow-sm">AMEX</span>
      <span className="inline-flex h-9 min-w-16 items-center justify-center rounded-md border border-border bg-surface px-2 text-sm font-bold italic shadow-sm"><span className="text-[#003087]">Pay</span><span className="text-[#009CDE]">Pal</span></span>
      <span className="inline-flex h-9 min-w-20 items-center justify-center rounded-md border border-border bg-surface px-2 text-sm font-semibold shadow-sm">Apple Pay</span>
    </div>
  );
}

export default function CheckoutForm({ checkoutId, orderSummary }: { checkoutId: string; orderSummary: ReactNode }) {
  const [state, action, pending] = useActionState(placeOrder, {});
  return <form action={action} onSubmit={(event) => {
    const payment = new FormData(event.currentTarget).get("payment");
    trackEvent("order_submit", { payment_outcome: typeof payment === "string" ? payment : "unknown" });
  }} className="grid items-start gap-8 lg:grid-cols-5">
    <input type="hidden" name="checkoutId" value={checkoutId} />
    <fieldset disabled={pending} className="contents">
      <section className="rounded-lg border border-border bg-surface p-4 sm:p-6 lg:col-span-3 lg:col-start-1 lg:row-start-1">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold">Delivery details</h2>
          <p className="text-sm text-text-muted"><span className="text-danger">*</span> Required fields</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><DeliveryField name="name" label="Full name" autoComplete="name" minLength={2} maxLength={100} state={state} /></div>
          <div className="sm:col-span-2"><DeliveryField name="email" label="Email address" type="email" inputMode="email" autoComplete="email" minLength={3} maxLength={254} help="We’ll send the demo order confirmation here." state={state} /></div>
          <div className="sm:col-span-2"><DeliveryField name="address" label="Address" autoComplete="street-address" minLength={5} maxLength={200} state={state} /></div>
          <DeliveryField name="city" label="Town or city" autoComplete="address-level2" minLength={2} maxLength={100} state={state} />
          <DeliveryField name="postcode" label="UK postcode" autoComplete="postal-code" minLength={5} maxLength={12} pattern="[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}" help="For example, SW1A 1AA." state={state} />
        </div>
      </section>
      <div className="lg:sticky lg:top-32 lg:col-span-2 lg:col-start-4 lg:row-span-4 lg:row-start-1">{orderSummary}</div>
      <section className="grid gap-5 rounded-lg border border-border bg-surface p-4 sm:p-6 lg:col-span-3 lg:col-start-1">
        <h2 className="text-xl font-bold">Demo payment</h2>
        <PaymentIcons />
        <p className="text-sm text-text-muted">This is a simulated payment. No money will be charged and no card details are required.</p>
        <label htmlFor="payment" className="font-medium">Simulated payment outcome
          <Select id="payment" name="payment" defaultValue="approve" className="mt-1.5 w-full">
            <option value="approve">Payment approved</option>
            <option value="decline">Payment declined</option>
            <option value="pending">Leave payment pending</option>
          </Select>
        </label>
      </section>
      <Button type="submit" loading={pending} loadingLabel="Placing order" size="lg" className="lg:col-span-3 lg:col-start-1">Place demo order</Button>
    </fieldset>
    {state.error && <StatusMessage role="alert" className="rounded-md border border-danger bg-surface p-3 lg:col-span-3 lg:col-start-1">{state.error}</StatusMessage>}
  </form>;
}
