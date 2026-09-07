"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

type Suggestion = Pick<Product, "id" | "title" | "image" | "category">;

export default function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<{ query: string; items: Suggestion[]; error?: string } | null>(null);
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
        if (!controller.signal.aborted) setResponse({ query: trimmed, items: data.items });
      } catch (error) {
        if (!controller.signal.aborted) setResponse({ query: trimmed, items: [], error: error instanceof Error ? error.message : "Suggestions are unavailable." });
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
    <div ref={containerRef} className="relative w-full max-w-xl" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
    }}>
      <form role="search" onSubmit={(event) => {
        event.preventDefault();
        setIsOpen(false);
        router.push(resultsHref);
      }}>
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
          className="w-full p-2 border"
        />
      </form>
      {isOpen && eligible && (
        <div id="product-suggestions" className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p role="status" className="text-sm text-gray-500">
            {loading ? "Searching…" : current?.error ?? (current?.items.length ? "Suggested products" : `No suggestions for “${trimmed}”`)}
          </p>
          {!loading && current && !current.error && (
            <ul className="grid gap-2">
              {current.items.map(product => (
                <li key={product.id}>
                  <Link href={`/products/${product.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50">
                    <img src={product.image} alt="" className="h-12 w-12 object-contain" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.category.replaceAll("-", " ")}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href={resultsHref} onClick={() => setIsOpen(false)} className="mt-3 block border-t border-gray-100 pt-3 text-sm font-medium text-blue-600 hover:underline">
            See all results for “{trimmed}”
          </Link>
        </div>
      )}
    </div>
  );
}
