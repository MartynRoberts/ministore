"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { useShop } from "@/app/ShopProvider";
import { Button, buttonStyles } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormControls";
import { PageContainer } from "@/components/ui/Layout";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

type Props = {
  products: Product[];
};

export default function FavouritesClient({ products }: Props) {
  const [search, setSearch] = useState("");
  const { favs, toggleFav, addToBasket, clearFavourites, pending } = useShop();
  const favouriteProducts = useMemo(() => products.filter(product => favs.includes(product.id)), [products, favs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return favouriteProducts.filter(product => !term || product.title.toLowerCase().includes(term));
  }, [favouriteProducts, search]);
  const recommendations = products.filter(product => !favs.includes(product.id)).slice(0, 4);

  return (
    <PageContainer>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Favourites</h1><LoadingIndicator active={pending} label="Updating favourites" /></div>
          <p className="mt-1 text-text-muted">Save products here while you decide.</p>
        </div>
        {favouriteProducts.length > 0 && <Button variant="secondary" size="sm" disabled={pending} onClick={clearFavourites}>Clear all</Button>}
      </div>

      {favs.length > 0 && favouriteProducts.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold">Your saved products are unavailable</h2>
          <p className="mt-2 text-text-muted">They may have been removed from the current catalogue.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3"><Button variant="secondary" onClick={clearFavourites}>Clear favourites</Button><Link href="/products" className={buttonStyles()}>Browse products</Link></div>
        </section>
      ) : favouriteProducts.length === 0 ? (
        <>
          <section className="rounded-lg border border-border bg-surface px-5 py-10 text-center sm:px-8 sm:py-14">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-text-muted"><HeartIcon className="h-8 w-8" /></span>
            <h2 className="mt-5 text-2xl font-bold">No favourites yet</h2>
            <p className="mx-auto mt-2 max-w-md text-text-muted">Select the heart on any product to save it here for later.</p>
            <Link href="/products" className={buttonStyles({ size: "lg", className: "mt-6" })}>Browse products</Link>
          </section>
          {recommendations.length > 0 && <section className="mt-12" aria-labelledby="favourite-recommendations-heading">
            <div className="mb-5 flex items-end justify-between gap-4"><div><h2 id="favourite-recommendations-heading" className="text-2xl font-bold">Popular right now</h2><p className="mt-1 text-text-muted">Tap a heart to start your list</p></div><Link href="/products" className="shrink-0 font-semibold underline hover:no-underline">View all</Link></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{recommendations.map(product => <ProductCard key={product.id} product={product} isFav={false} onToggleFav={toggleFav} onAddToBasket={addToBasket} />)}</div>
          </section>}
        </>
      ) : (
        <>
          <div className="mb-6 grid items-end gap-4 sm:grid-cols-[minmax(0,28rem)_auto]">
            <label htmlFor="favourites-search" className="block font-medium">Search your favourites
              <TextInput id="favourites-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search saved products..." className="mt-1.5" />
            </label>
            <p className="text-sm text-text-muted" role="status">{filtered.length} of {favouriteProducts.length} {favouriteProducts.length === 1 ? "favourite" : "favourites"}</p>
          </div>
          {filtered.length > 0 ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{filtered.map(product => <ProductCard key={product.id} product={product} isFav onToggleFav={toggleFav} onAddToBasket={addToBasket} />)}</div>
            : <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10"><h2 className="text-xl font-bold">No matching favourites</h2><p className="mt-2 text-text-muted">Try a different product name.</p><Button variant="secondary" className="mt-5" onClick={() => setSearch("")}>Clear search</Button></section>}
        </>
      )}
    </PageContainer>
  );
}
