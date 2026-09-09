import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const controlStyles = "min-h-11 rounded-md border border-border bg-surface px-3 text-text outline-none transition placeholder:text-text-muted focus:border-focus focus:ring-1 focus:ring-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${controlStyles} w-full ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlStyles} cursor-pointer pr-10 ${className}`} {...props}>{children}</select>;
}
