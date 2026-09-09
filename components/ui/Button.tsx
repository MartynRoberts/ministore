import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary border-primary hover:bg-primary-hover",
  secondary: "bg-surface text-text border-border hover:bg-surface-muted",
  ghost: "border-transparent bg-transparent text-text hover:bg-surface-muted",
  danger: "bg-danger text-on-primary border-danger hover:opacity-90",
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
  return `inline-flex items-center justify-center rounded-md border font-semibold no-underline transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
