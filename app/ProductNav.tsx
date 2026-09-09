"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

export const productDepartments = [
  {
    title: "Technology",
    categories: ["laptops", "smartphones", "tablets", "mobile-accessories"],
  },
  {
    title: "Home",
    categories: [
      "furniture",
      "home-decoration",
      "kitchen-accessories",
      "groceries",
    ],
  },
  {
    title: "Women",
    categories: [
      "womens-bags",
      "womens-dresses",
      "womens-jewellery",
      "womens-shoes",
      "womens-watches",
      "tops",
    ],
  },
  {
    title: "Men",
    categories: ["mens-shirts", "mens-shoes", "mens-watches", "sunglasses"],
  },
  {
    title: "Lifestyle",
    categories: [
      "beauty",
      "fragrances",
      "skin-care",
      "sports-accessories",
      "motorcycle",
      "vehicle",
    ],
  },
] as const;

export function categoryLabel(category: string) {
  return category
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ProductMenuContent({
  onNavigate,
  compact = false,
}: {
  onNavigate: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact ? "pt-4" : "mx-auto w-full max-w-content px-4 py-6 sm:py-8"
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className={compact ? "text-xl font-bold" : "text-2xl font-bold"}>
            Browse by department
          </h2>
        </div>
        <Link
          href="/products"
          onClick={onNavigate}
          className="shrink-0 font-semibold underline underline-offset-4"
        >
          Shop all
        </Link>
      </div>

      <div
        className={`grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 ${compact ? "" : "lg:grid-cols-5"}`}
      >
        {productDepartments.map((department) => (
          <section
            key={department.title}
            aria-labelledby={`department-${compact ? "mobile-" : ""}${department.title.toLowerCase()}`}
          >
            <h3
              id={`department-${compact ? "mobile-" : ""}${department.title.toLowerCase()}`}
              className="mb-3 font-bold"
            >
              {department.title}
            </h3>
            <ul className="space-y-2">
              {department.categories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/products?category=${encodeURIComponent(category)}`}
                    onClick={onNavigate}
                    className="inline-flex min-h-8 items-center text-sm text-text-muted transition hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  >
                    {categoryLabel(category)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function ProductNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        containerRef.current
          ?.querySelector<HTMLButtonElement>("button")
          ?.focus();
      }
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="static hidden xl:block">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="product-menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-text transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        Shop
        <ChevronIcon direction={open ? "up" : "down"} className="h-4 w-4 transition-transform" />
      </button>

      {open && (
        <div
          id="product-menu"
          className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-7rem)] overflow-y-auto border-y border-border bg-surface shadow-card"
        >
          <ProductMenuContent onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
