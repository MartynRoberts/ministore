"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/app/ShopProvider";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/ui/Layout";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

type Props = {
  products: Product[];
};

export default function FavouritesClient({ products }: Props) {
  const [search, setSearch] = useState("");
  const { favs, toggleFav, addToBasket, clearFavourites } = useShop();

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch = !s || p.title.toLowerCase().includes(s);
      const matchesFavourites = favs.includes(p.id);
      return matchesSearch && matchesFavourites;
    });
  }, [products, search, favs]);

  const clearFilters = () => {
    setSearch("");
  };

  if (!search.trim() && favs.length > 0 && filtered.length === 0) {
    return (
      <PageContainer>
        <h4>Your favourites could not be found.</h4>
        <Button variant="secondary" onClick={clearFavourites}>Clear favourites</Button>
        <Link href="/products" className="inline-flex items-center gap-2"><ChevronIcon className="h-4 w-4" />Browse products</Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-xl font-bold mb-8">Favourites</h1>

      {favs.length > 0 && search && (
        <Button id="clear" variant="ghost" size="sm" onClick={clearFilters} className="mt-3">
          Clear search
        </Button>
      )}

      {!filtered.length &&
        (favs.length === 0 ? (
          <>
            <h4>You have not set any products as favourites yet.</h4>
            <p>Tap the heart on a product to add it to favourites.</p>
            <Link href="/products" className="inline-flex items-center gap-2"><ChevronIcon className="h-4 w-4" />Browse products</Link>
          </>
        ) : (
          <h4>No favourites match &quot;{search.trim()}&quot;.</h4>
        ))}

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isFav={favs.includes(p.id)}
              onToggleFav={toggleFav}
              onAddToBasket={addToBasket}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
