"use client";

import type { CatalogueResult, CatalogueQuery } from "@/lib/catalogue-query";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useShop } from "@/app/ShopProvider";
import ProductCard from "@/components/ProductCard";

import ProductSortSelect from "@/components/ProductSortSelect";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormControls";
import { PageContainer } from "@/components/ui/Layout";

type Props = {
  result: CatalogueResult;
  query: CatalogueQuery;
};

export default function ProductListClient({ result, query }: Props) {
  const { favs, addToBasket, toggleFav } = useShop();

  const { search, category, sort, favsOnly } = query;
  const { items: pagedResults, page: clampedPage, totalPages, total: resultsCount } = result;
  const { updateParam, clearFilters, pending } = useProductFilters();

  const sortOptions = [
    { id: "relevance", name: "Relevance" },
    { id: "low-high", name: "Low → High" },
    { id: "high-low", name: "High → Low" },
    { id: "a-z", name: "A → Z" },
    { id: "z-a", name: "Z → A" },
  ];

  return (
    <PageContainer>
      <fieldset disabled={pending} className="flex flex-wrap items-center gap-3 mb-3">
        <Select aria-label="Category" value={category} onChange={(event) => updateParam("category", event.target.value)} className="w-auto">
          <option value="">All categories</option>
          {category && !result.facets.categories.some(facet => facet.value === category) && <option value={category}>{category} (0)</option>}
          {result.facets.categories.map(facet => <option key={facet.value} value={facet.value}>{facet.value.replaceAll("-", " ")} ({facet.count})</option>)}
        </Select>

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
          <Button id="clear" variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}

        <ProductSortSelect
          sortOptions={sortOptions}
          value={sort}
          onChange={(value: string) => updateParam("sort", value)}
        />
      </fieldset>
      {pending && <p role="status">Updating products…</p>}

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
              {search && <span> for &quot;{search}&quot;</span>}
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

      <fieldset disabled={pending}><Pagination page={clampedPage} totalPages={totalPages} updateParam={updateParam} /></fieldset>
    </PageContainer>
  );
}
