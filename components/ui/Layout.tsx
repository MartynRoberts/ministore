import type { HTMLAttributes, ReactNode } from "react";

export function PageContainer({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto my-16 w-full max-w-content px-4 ${className}`} {...props} />;
}

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-border bg-surface ${className}`} {...props} />;
}

export function StatusMessage({ children, tone = "error", className = "", ...props }: HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  tone?: "error" | "success" | "warning" | "muted";
}) {
  const tones = { error: "text-danger", success: "text-success", warning: "text-warning", muted: "text-text-muted" };
  return <p className={`${tones[tone]} ${className}`} {...props}>{children}</p>;
}
