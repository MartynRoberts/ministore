"use client";

import { useActionState } from "react";
import { beginCheckout } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/Layout";

export default function CheckoutButton({ disabled = false }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState(beginCheckout, {});

  return (
    <form action={action}>
      <Button type="submit" loading={pending} loadingLabel="Reserving stock" disabled={disabled} size="lg" className="w-full" data-umami-event="checkout_begin">
        Continue to checkout
      </Button>
      {state.error && <StatusMessage role="alert" className="mt-3 text-sm">{state.error}</StatusMessage>}
    </form>
  );
}
