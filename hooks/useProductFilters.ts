"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function useProductFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const navigate = (params: URLSearchParams, replace = false) => {
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    startTransition(() => replace ? router.replace(url) : router.push(url));
  };
  const updateParam = (key: string, value?: string, options?: { replace?: boolean }) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === "relevance") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    navigate(next, options?.replace);
  };
  const clearFilters = () => {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    navigate(next);
  };
  return { updateParam, clearFilters, pending };
}
