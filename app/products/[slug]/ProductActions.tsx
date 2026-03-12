"use client";

import { useState } from "react";
import { useShop } from "@/app/ShopProvider";

const sizes = ["S", "M", "L", "XL"];

export default function ProductActions({
  productId,
  category,
}: {
  productId: number;
  category: string;
}) {
  const { addToBasket, toggleFav, favs } = useShop();
  const isFav = favs.includes(productId);

  const isClothing =
    category === "men's clothing" || category === "women's clothing";

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="mt-4">
      {/* Size selector */}
      {isClothing && (
        <div className="mb-4">
          <p className="mb-2 font-medium">Size</p>

          <div className="flex justify-start gap-2">
            {sizes.map((size) => {
              const selected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-10 w-12 mb-8 cursor-pointer rounded border text-sm font-medium transition
                    ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-gray-300 hover:border-black"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => addToBasket(productId)}
          disabled={isClothing && !selectedSize}
          className={`h-14 mb-8 flex-1 rounded-md px-6 text-lg font-semibold transition
            ${
              isClothing && !selectedSize
                ? "bg-gray-200 cursor-not-allowed text-gray-500"
                : "bg-black hover:bg-gray-800 cursor-pointer text-white"
            }`}
        >
          Add to basket
        </button>

        <button
          onClick={() => toggleFav(productId)}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          className="flex h-14 w-14 mb-8 cursor-pointer items-center justify-center rounded-md border border-gray-300 transition hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${
              isFav ? "fill-red-500 stroke-red-500" : "stroke-gray-700"
            }`}
            fill={isFav ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s-6.716-4.518-9.428-7.23A5.25 5.25 0 0112 4.5a5.25 5.25 0 019.428 9.27C18.716 16.482 12 21 12 21z"
            />
          </svg>

          <span className="sr-only">
            {isFav ? "Remove from favourites" : "Add to favourites"}
          </span>
        </button>
      </div>
    </div>
  );
}