"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/app/ShopProvider";

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
      <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
        <h4>Your favourites could not be found.</h4>
        <button onClick={clearFavourites}>Clear favourites</button>
        <Link href="/products">← Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
      <h1 className="text-xl font-bold mb-8">Favourites</h1>

      {favs.length > 0 && search && (
        <button id="clear" onClick={clearFilters} className="mt-3">
          Clear search
        </button>
      )}

      {!filtered.length &&
        (favs.length === 0 ? (
          <>
            <h4>You have not set any products as favourites yet.</h4>
            <p>Tap the heart on a product to add it to favourites.</p>
            <Link href="/products">← Browse products</Link>
          </>
        ) : (
          <h4>No favourites match "{search.trim()}".</h4>
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
    </div>
  );
}