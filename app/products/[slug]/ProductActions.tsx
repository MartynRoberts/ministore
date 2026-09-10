"use client";

import { useState } from "react";
import { useShop } from "@/app/ShopProvider";

import { getVariants } from "@/lib/basket";
import { Button } from "@/components/ui/Button";
import { HeartIcon } from "@/components/ui/HeartIcon";

export default function ProductActions({
  productId,
  category,
}: {
  productId: number;
  category: string;
}) {
  const { addToBasket, toggleFav, favs, pending } = useShop();
  const isFav = favs.includes(productId);

  const variants = getVariants({ id: productId, category });
  const isClothing = variants.length > 1;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <div className="mt-4">
      {/* Size selector */}
      {isClothing && (
        <div className="mb-4">
          <p className="mb-2 font-medium">Size</p>

          <div className="flex justify-start gap-2">
            {variants.map(({ id: variantId, label: size }) => {
              const selected = selectedSize === variantId;

              return (
                <Button
                  variant={selected ? "primary" : "secondary"}
                  size="sm"
                  key={size}
                  onClick={() => setSelectedSize(variantId)}
                  className="mb-8 h-10 w-12 px-0"
                >
                  {size}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="lg"
          onClick={() => addToBasket(productId, selectedSize ?? variants[0].id)}
          disabled={pending || (isClothing && !selectedSize)}
          className="mb-8 flex-1"
        >
          Add to basket
        </Button>

        <Button
          variant="secondary"
          size="icon"
          disabled={pending}
          onClick={() => toggleFav(productId)}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          className="mb-8 h-14 w-14"
        >
          <HeartIcon filled={isFav} className={`h-7 w-7 ${isFav ? "text-danger" : "text-text-muted"}`} />

          <span className="sr-only">
            {isFav ? "Remove from favourites" : "Add to favourites"}
          </span>
        </Button>
      </div>
    </div>
  );
}
