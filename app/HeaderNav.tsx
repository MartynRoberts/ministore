"use client";

import Link from "next/link";
import { useShop } from "./ShopProvider";

export default function HeaderNav() {
  const { basket } = useShop();


  const basketCount = basket.count;

  return (
    <nav aria-label="Account and basket" className="flex items-center justify-self-end gap-1 text-xs min-[400px]:gap-3 min-[400px]:text-sm sm:gap-6 sm:text-base xl:gap-8">
      <Link href="/orders" className="inline-flex min-h-11 items-center px-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">Orders</Link>
      <Link href="/favourites" className="inline-flex min-h-11 items-center px-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">Favourites</Link>

      <Link href="/basket" className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="h-6 w-6 sm:h-7 sm:w-7"
        >
          <path d="M3 9h18l-2 10H5L3 9z" />
          <path d="M8 9l4-6 4 6" />
        </svg>

        {basketCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black px-1 text-xs font-semibold text-white">
            {basketCount}
          </span>
        )}

        <span className="sr-only">Basket ({basketCount})</span>
      </Link>
    </nav>
  );
}
