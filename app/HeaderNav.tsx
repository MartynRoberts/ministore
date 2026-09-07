"use client";

import Link from "next/link";
import { useShop } from "./ShopProvider";

export default function HeaderNav() {
  const { basket } = useShop();


  const basketCount = basket.count;

  return (
    <div className="ml-auto flex items-center gap-8">
      <Link href="/favourites" className="hover:underline">Favourites</Link>

      <Link href="/basket" className="relative inline-flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="h-7 w-7"
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
    </div>
  );
}
