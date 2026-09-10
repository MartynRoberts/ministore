import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./LoadingIndicator";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-primary bg-primary text-on-primary no-underline shadow-button hover:bg-primary-hover hover:shadow-button-hover",
  secondary: "border-2 border-primary bg-surface text-text no-underline shadow-button hover:bg-primary hover:text-on-primary hover:shadow-button-hover",
  ghost: "border border-transparent bg-transparent text-text underline underline-offset-4 hover:bg-surface-muted",
  danger: "border border-danger bg-danger text-on-primary no-underline shadow-button hover:opacity-90 hover:shadow-button-hover",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-11 px-4 py-2",
  lg: "min-h-14 px-6 py-3 text-lg",
  icon: "h-11 w-11 p-0",
};

export function buttonStyles({ variant = "primary", size = "md", className = "" }: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return `inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-[color,background-color,border-color,box-shadow,transform] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
};

export function Button({ variant, size, className, type = "button", loading = false, loadingLabel = "Loading", children, disabled, "aria-label": ariaLabel, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonStyles({ variant, size, className })} relative`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={loading ? loadingLabel : ariaLabel}
      {...props}
    >
      <span className={loading ? "invisible" : undefined}>{children}</span>
      {loading && <Spinner className="absolute h-5 w-5" />}
    </button>
  );
}
