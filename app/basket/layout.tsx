import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your basket", robots: { index: false, follow: false } };

export default function BasketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
