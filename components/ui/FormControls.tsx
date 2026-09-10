import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { ChevronIcon } from "./ChevronIcon";

const controlStyles = "min-h-11 rounded-md border border-border bg-surface px-3 text-text outline-none transition placeholder:text-text-muted focus:border-focus focus:ring-1 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlStyles} w-full ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative inline-block min-w-0 align-middle ${className}`}>
      <select className={`${controlStyles} peer h-full w-full cursor-pointer appearance-none pr-11`} {...props}>
        {children}
      </select>
      <ChevronIcon
        direction="down"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted peer-disabled:opacity-50"
      />
    </span>
  );
}
