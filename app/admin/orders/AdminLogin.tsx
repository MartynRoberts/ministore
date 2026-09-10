"use client";
import { useActionState, useState } from "react";
import { loginAdmin } from "@/app/actions/orders";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormControls";
import { StatusMessage } from "@/components/ui/Layout";
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
        <TextInput
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
          className="min-w-0 flex-1 rounded-r-none border-r-0 focus:z-10"
        />
        <Button
          type="button"
          aria-controls="admin-password"
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
          variant="secondary"
          className="rounded-l-none"
        >
          {showPassword ? "Hide" : "Show"}
        </Button>
        </div>
        <p id="admin-password-help" className="mt-2 text-sm text-text-muted">
          Enter 8–128 characters. For this demo, use <strong>password</strong>.
        </p>
      </div>
      <Button type="submit" loading={pending} loadingLabel="Signing in">Sign in</Button>
      {state.error && <StatusMessage role="alert">{state.error}</StatusMessage>}
    </form>
  );
}
