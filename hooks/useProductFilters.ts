"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";
import type { Product } from "@/types";

type UpdateOptions = { replace?: boolean };

export function useProductFilters(products: Product[], favs: number[]) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "relevance";
  const favsOnly = searchParams.get("favs") === "true";

  const rawPage = Number(searchParams.get("page") ?? "1");
  const safePage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1; // isFinite checks to see if the number is Nan or infinite
  const pageSize = 9;

  const updateParam = useCallback((key: string, value?: string, options?: UpdateOptions) => {
    const next = new URLSearchParams(searchParams.toString());

    if (!value || value === "relevance" || (key === "page" && parseInt(value) <= 0)) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    if (key !== "page") {
      next.delete("page");
    }

    const query = next.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [searchParams, pathname, router]);

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams();
    const currentSort = searchParams.get("sort");

    if (currentSort && currentSort !== "relevance") {
      next.set("sort", currentSort);
    }

    const query = next.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    router.push(url);
  }, [searchParams, pathname, router]);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filteredResults = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !s || p.title.toLowerCase().includes(s);
      const matchesCategory = !category || p.category === category;
      const matchesFavourites = !favsOnly || favs.includes(p.id);
      return matchesSearch && matchesCategory && matchesFavourites;
    });
  }, [products, search, category, favsOnly, favs]);

  const sortedResults = useMemo(() => {
    const copy = [...filteredResults];
    switch (sort) {
      case "low-high":
        return copy.sort((a, b) => a.price - b.price);
      case "high-low":
        return copy.sort((a, b) => b.price - a.price);
      case "a-z":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return copy.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return filteredResults;
    }
  }, [filteredResults, sort]);

  const totalPages = Math.ceil(sortedResults.length / pageSize);
  const clampedPage = totalPages > 0 ? Math.min(safePage, totalPages) : 1; // If safePage is higher than the last page then limit it

  const paginationStart = (clampedPage-1)*pageSize;
  const pagedResults = sortedResults.slice(paginationStart, paginationStart+pageSize);

  const resultsCount = sortedResults.length;

  return { 
    search,
    category,
    sort,
    favsOnly,
    categories,
    pagedResults,
    clampedPage,
    totalPages,
    resultsCount,
    updateParam,
    clearFilters
  }
};