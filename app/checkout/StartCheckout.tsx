"use client";
import { useActionState } from "react";
import { beginCheckout } from "@/app/actions/checkout";
export default function StartCheckout() {
  const [state, action, pending] = useActionState(beginCheckout, {});
  return <form action={action} className="my-6">
    <p className="mb-3">Reserve your items for 15 minutes while you complete checkout.</p>
    <button disabled={pending} className="rounded bg-black p-4 text-white disabled:opacity-50">{pending ? "Reserving stock…" : "Start checkout"}</button>
    {state.error && <p role="alert" className="mt-3 text-red-700">{state.error}</p>}
  </form>;
}
