"use client";

import type { Product } from "@/types";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useShop } from "@/app/ShopProvider";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import ProductSortSelect from "@/components/ProductSortSelect";
import Pagination from "@/components/Pagination";

type Props = {
  products: Product[];
};

export default function ProductListClient({ products }: Props) {
  const { favs, addToBasket, toggleFav } = useShop();

  const {
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
    clearFilters,
  } = useProductFilters(products, favs);

  const sortOptions = [
    { id: "relevance", name: "Relevance" },
    { id: "low-high", name: "Low → High" },
    { id: "high-low", name: "High → Low" },
    { id: "a-z", name: "A → Z" },
    { id: "z-a", name: "Z → A" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1680px] px-4 my-16">
      <div className="flex items-center gap-3 mb-3">
        <CategoryFilter
          categories={categories}
          value={category}
          onChange={(value) => updateParam("category", value)}
        />

        <p className="m-0 opacity-80">{resultsCount} results</p>

        <label>
          Show favourites only{" "}
          <input
            type="checkbox"
            onChange={(e) => updateParam("favs", e.target.checked ? "true" : "")}
            checked={favsOnly}
          />
        </label>

        {(category || search || favsOnly) && (
          <button id="clear" onClick={clearFilters}>
            Clear
          </button>
        )}

        <ProductSortSelect
          sortOptions={sortOptions}
          value={sort}
          onChange={(value) => updateParam("sort", value)}
        />
      </div>

      {pagedResults.length === 0 &&
        (favsOnly ? (
          <p>
            {favs.length === 0
              ? "You have not set any products as favourites yet."
              : "No favourites match your filters."}
          </p>
        ) : (
          <>
            <h3>
              No matching products found
              {search && <span> for "{search}"</span>}
              {category && <span> in {category} category</span>}
            </h3>
            <p>Try adjusting your search or filters.</p>
          </>
        ))}

      {pagedResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pagedResults.map((p) => (
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

      <Pagination page={clampedPage} totalPages={totalPages} updateParam={updateParam} />
    </div>
  );
}