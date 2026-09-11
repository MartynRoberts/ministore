"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import Image from "next/image";
import { trackEvent } from "@/lib/analytics";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m16 16 4 4" />
    </svg>
  );
}

type Suggestion = Pick<Product, "id" | "title" | "image" | "category">;

export default function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<{ query: string; items: Suggestion[]; total: number; error?: string } | null>(null);
  const trimmed = query.trim();
  const eligible = trimmed.length >= 2;
  const current = response?.query === trimmed ? response : null;
  const loading = eligible && !current;

  useEffect(() => {
    if (!isOpen || !eligible) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await fetch(`/api/products/suggestions?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (!result.ok) throw new Error("Suggestions are unavailable. Submit your search to see results.");
        const data = await result.json();
        if (!controller.signal.aborted) setResponse({
          query: trimmed,
          items: data.items,
          total: typeof data.total === "number" ? data.total : data.items.length,
        });
      } catch (error) {
        if (!controller.signal.aborted) setResponse({ query: trimmed, items: [], total: 0, error: error instanceof Error ? error.message : "Suggestions are unavailable." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, eligible, isOpen]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const resultsHref = trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products";
  return (
    <div ref={containerRef} className="relative col-span-3 row-start-2 w-full xl:col-span-1 xl:col-start-3 xl:row-start-1 xl:max-w-3xl" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
    }}>
      <form role="search" className="relative" onSubmit={(event) => {
        event.preventDefault();
        setIsOpen(false);
        trackEvent("product_search");
        router.push(resultsHref);
      }}>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          aria-label="Search products"
          aria-controls={isOpen && eligible ? "product-suggestions" : undefined}
          autoComplete="off"
          maxLength={200}
          value={query}
          placeholder="Search products..."
          onFocus={() => setIsOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setIsOpen(true); }}
          onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }}
          className="h-11 w-full rounded-sm border border-border bg-surface py-2 pl-12 pr-4 text-base text-text outline-none transition placeholder:text-text-muted focus:border-focus focus:ring-1 focus:ring-focus"
        />
      </form>
      {isOpen && eligible && (
        <div id="product-suggestions" role="region" aria-label="Product search suggestions" className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="font-semibold">Search suggestions</p>
            <div className="flex items-center gap-2 text-sm text-text-muted">
            <LoadingIndicator active={loading} label="Searching products" />
              <p role="status" aria-live="polite">
                {loading ? (
                  <span className="sr-only">Searching products</span>
                ) : current?.error ? (
                  "Unavailable"
                ) : current?.items.length ? (
                  current.total > current.items.length
                    ? `Showing ${current.items.length} of ${current.total}`
                    : `${current.total} ${current.total === 1 ? "result" : "results"}`
                ) : (
                  "No matches"
                )}
              </p>
            </div>
          </div>

          {loading && (
            <div className="grid gap-1 p-2" aria-hidden="true">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-md p-2">
                  <span className="h-14 w-14 shrink-0 animate-pulse rounded-md bg-skeleton motion-reduce:animate-none" />
                  <span className="min-w-0 flex-1">
                    <span className="block h-4 w-4/5 animate-pulse rounded bg-skeleton motion-reduce:animate-none" />
                    <span className="mt-2 block h-3 w-2/5 animate-pulse rounded bg-skeleton motion-reduce:animate-none" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && current?.error && (
            <div className="flex gap-3 px-4 py-5 text-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-surface text-danger">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v6m0 4h.01"/></svg>
              </span>
              <div><p className="font-semibold">Suggestions are unavailable</p><p className="mt-1 text-text-muted">Submit your search to view the full results page.</p></div>
            </div>
          )}

          {!loading && current && !current.error && current.items.length === 0 && (
            <div className="px-4 py-6 text-center">
              <SearchIcon className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-3 font-semibold">No suggested products</p>
              <p className="mt-1 text-sm text-text-muted">Try a broader product name or browse all search results.</p>
            </div>
          )}

          {!loading && current && !current.error && current.items.length > 0 && (
            <ul className="max-h-[min(24rem,55vh)] divide-y divide-border overflow-y-auto p-2">
              {current.items.map(product => (
                <li key={product.id}>
                  <Link href={`/products/${product.id}`} data-umami-event="search_suggestion_select" data-umami-event-product-id={product.id} onClick={() => setIsOpen(false)} className="group flex min-h-16 items-center gap-3 rounded-md p-2 text-inherit no-underline hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-surface-muted p-1">
                      <Image src={product.image} alt="" width={56} height={56} className="max-h-full max-w-full object-contain" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:underline">{product.title}</p>
                      <p className="mt-0.5 text-sm capitalize text-text-muted">{product.category.replaceAll("-", " ")}</p>
                    </div>
                    <ChevronIcon direction="right" className="h-5 w-5 text-text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link href={resultsHref} data-umami-event="search_results_view_all" onClick={() => setIsOpen(false)} className="flex min-h-12 items-center justify-between gap-3 border-t border-border bg-primary px-4 py-3 font-semibold text-on-primary no-underline transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-on-primary">
            <span className="min-w-0 truncate">See all results for “{trimmed}”</span>
            <ChevronIcon direction="right" className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
