"use client";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/actions/orders";
export default function AdminLogin() {
  const [state, action, pending] = useActionState(loginAdmin, {});
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="max-w-md space-y-4" noValidate={false}>
      <div>
        <label htmlFor="admin-password" className="block font-medium">
        Admin password
        </label>
        <div className="mt-2 flex">
        <input
          id="admin-password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password is 'password'"
          autoComplete="current-password"
          aria-describedby="admin-password-help"
          aria-invalid={state.error ? true : undefined}
          required
          minLength={8}
          maxLength={128}
          autoFocus
          className="block min-w-0 flex-1 rounded-l border border-r-0 p-3 focus:z-10 focus:outline-2 focus:outline-black"
        />
        <button
          type="button"
          aria-controls="admin-password"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
          className="rounded-r border px-4 hover:bg-gray-50 focus:outline-2 focus:outline-black"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        </div>
        <p id="admin-password-help" className="mt-2 text-sm text-gray-600">
          Enter 8–128 characters. For this demo, use <strong>password</strong>.
        </p>
      </div>
      <button disabled={pending} className="rounded bg-black p-3 text-white disabled:cursor-wait disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state.error && <p role="alert" className="text-red-700">{state.error}</p>}
    </form>
  );
}
