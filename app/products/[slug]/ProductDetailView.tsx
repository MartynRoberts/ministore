import Link from "next/link";
import ProductActions from "./ProductActions";
import ProductScroller from "@/components/ProductScroller";
import Skeleton from "@/components/Skeleton";
import { formatGBP } from "@/utils/money";
import type { Product } from "@/types";

type Props = {
  product?: Product;
  recommendations?: Product[];
  loading?: boolean;
};

export default function ProductDetailView({
  product,
  recommendations = [],
  loading = false,
}: Props) {
  const categoryTitle =
    product?.category.charAt(0).toUpperCase() + product?.category.slice(1);

  return (
    <div className="mx-auto my-16 w-full max-w-[1680px] px-4">
      <div className="mb-6">
        {loading ? (
          <Skeleton className="h-4 w-[220px]" />
        ) : (
          <>
            <Link href="/Home">Home</Link>
            <span className="mx-1">/</span>
            <span>{product?.title}</span>
          </>
        )}
      </div>

      <div className="mt-16 flex flex-col justify-between gap-10 lg:flex-row">
        <div className="aspect-square w-full max-w-full lg:max-w-[800px]">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <img
              src={product?.image}
              alt={product?.title}
              className="h-full w-full object-contain"
              draggable={false}
            />
          )}
        </div>

        <div className="lg:max-w-[700px] w-full">
          {loading ? (
            <>
              <Skeleton className="mb-3 h-7 w-[320px]" />
              <Skeleton className="mb-8 h-7 w-[120px]" />
              <Skeleton className="mb-8 h-14 w-full rounded-md" />
              <Skeleton className="mb-3 h-5 w-full max-w-[700px]" />
              <Skeleton className="mb-3 h-5 w-full max-w-[620px]" />
              <Skeleton className="mb-3 h-5 w-[220px]" />
            </>
          ) : (
            <>
              <h1 className="mb-3 text-xl font-bold">{product?.title}</h1>
              <p className="mb-8 text-lg font-bold">
                {formatGBP(product!.price)}
              </p>

              <ProductActions
                productId={product!.id}
                category={product!.category}
              />

              <p className="mb-3 max-w-[700px]">{product?.description}</p>

              <p className="mb-3">
                Category:{" "}
                <Link
                  href={`/products?category=${encodeURIComponent(
                    product!.category
                  )}`}
                  className="text-gray-600 underline hover:text-black"
                >
                  {categoryTitle}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <section className="mt-16">
          <Skeleton className="mb-4 h-8 w-[220px]" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[220px] shrink-0 overflow-hidden rounded-lg border border-gray-300"
              >
                <Skeleton className="aspect-square w-full" />
                <div className="p-4">
                  <Skeleton className="mb-2 h-5 w-full" />
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="mt-4 h-5 w-[80px]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <ProductScroller
          title="You may also like"
          products={recommendations}
          viewAllHref="/products"
        />
      )}
    </div>
  );
}