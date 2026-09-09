"use client";
import { useActionState } from "react";
import { beginCheckout } from "@/app/actions/checkout";
import { Button } from "@/components/ui/Button";
import { StatusMessage } from "@/components/ui/Layout";
export default function StartCheckout() {
  const [state, action, pending] = useActionState(beginCheckout, {});
  return <form action={action} className="my-6">
    <p className="mb-3">Reserve your items for 15 minutes while you complete checkout.</p>
    <Button type="submit" disabled={pending} size="lg">{pending ? "Reserving stock…" : "Start checkout"}</Button>
    {state.error && <StatusMessage role="alert" className="mt-3">{state.error}</StatusMessage>}
  </form>;
}
