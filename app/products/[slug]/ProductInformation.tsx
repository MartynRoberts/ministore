import Link from "next/link";
import type { Product } from "@/types";
import { formatGBP } from "@/utils/money";
import { Card, PageContainer } from "@/components/ui/Layout";
import ProductScroller from "@/components/ProductScroller";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";

function titleCase(value: string) {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function readableDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? null
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
}
function Stars({ rating, label = true }: { rating: number; label?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      role={label ? "img" : undefined}
      aria-label={label ? `${rating.toFixed(1)} out of 5 stars` : undefined}
      aria-hidden={label ? undefined : true}
    >
      <span className="inline-flex text-warning">
        {Array.from({ length: 5 }, (_, index) => (
          <svg
            key={index}
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill={rating >= index + 0.5 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m10 2 2.3 4.7 5.2.8-3.8 3.7.9 5.3-4.6-2.5-4.6 2.5.9-5.3-3.8-3.7 5.2-.8L10 2Z" />
          </svg>
        ))}
      </span>
    </span>
  );
}

export default function ProductInformation({
  product,
  recommendations,
}: {
  product: Product;
  recommendations: Product[];
}) {
  const images = product.images?.length ? product.images : [product.image];
  const reviews = product.reviews ?? [];
  const rating =
    product.rating ??
    (reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : undefined);
  const specifications = [
    ["Brand", product.brand],
    ["SKU", product.sku],
    [
      "Weight",
      product.weight !== undefined ? `${product.weight} kg` : undefined,
    ],
    [
      "Width",
      product.dimensions ? `${product.dimensions.width} cm` : undefined,
    ],
    [
      "Height",
      product.dimensions ? `${product.dimensions.height} cm` : undefined,
    ],
    [
      "Depth",
      product.dimensions ? `${product.dimensions.depth} cm` : undefined,
    ],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <PageContainer>
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-muted"
      >
        <Link href="/" className="hover:text-text hover:underline">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="hover:text-text hover:underline"
        >
          {titleCase(product.category)}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-text" aria-current="page">
          {product.title}
        </span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-3">
          <ProductGallery images={images} title={product.title} />
        </div>
        <div className="lg:sticky lg:top-32 lg:col-span-2">
          {product.brand && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
              {product.brand}
            </p>
          )}
          <h1 className="text-3xl font-bold leading-tight">{product.title}</h1>
          {rating !== undefined && (
            <a
              href="#reviews"
              className="mt-3 inline-flex items-center gap-2 text-sm hover:underline"
            >
              <Stars rating={rating} />
              <strong>{rating.toFixed(1)}</strong>
              <span className="text-text-muted">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </a>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-2xl font-bold">{formatGBP(product.price)}</p>
            {product.discountPercentage !== undefined &&
              product.discountPercentage > 0 && (
                <span className="rounded-full bg-danger-surface px-2.5 py-1 text-sm font-semibold text-danger">
                  {product.discountPercentage.toFixed(0)}% discount
                </span>
              )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${(product.stock ?? 1) > 0 ? "bg-success" : "bg-danger"}`}
            />
            <span className="font-semibold">
              {product.availabilityStatus ??
                ((product.stock ?? 1) > 0 ? "Available" : "Out of stock")}
            </span>
            {product.stock !== undefined && (
              <span className="text-sm text-text-muted">
                · {product.stock} in supplier stock
              </span>
            )}
          </div>
          <p className="mt-5 leading-7 text-text-muted">
            {product.description}
          </p>
          <ProductActions
            key={product.id}
            productId={product.id}
            category={product.category}
            available={(product.stock ?? 1) > 0}
          />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {product.shippingInformation && (
              <div className="rounded-md bg-surface-muted p-3">
                <p className="font-semibold">Delivery</p>
                <p className="mt-1 text-sm text-text-muted">
                  {product.shippingInformation}
                </p>
              </div>
            )}
            {product.returnPolicy && (
              <div className="rounded-md bg-surface-muted p-3">
                <p className="font-semibold">Returns</p>
                <p className="mt-1 text-sm text-text-muted">
                  {product.returnPolicy}
                </p>
              </div>
            )}
            {product.warrantyInformation && (
              <div className="rounded-md bg-surface-muted p-3">
                <p className="font-semibold">Warranty</p>
                <p className="mt-1 text-sm text-text-muted">
                  {product.warrantyInformation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-2xl font-bold">About this product</h2>
          <p className="mt-4 leading-7">{product.description}</p>
          <p className="mt-5 text-sm">
            Category:{" "}
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="font-semibold underline"
            >
              {titleCase(product.category)}
            </Link>
          </p>
        </Card>
        {specifications.length > 0 && (
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl font-bold">Product information</h2>
            <dl className="mt-4 divide-y divide-border">
              {specifications.map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 gap-4 py-3">
                  <dt className="text-text-muted">{label}</dt>
                  <dd className="text-right font-medium break-words">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
      </div>

      <section
        id="reviews"
        className="mt-16 scroll-mt-32"
        aria-labelledby="reviews-heading"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="reviews-heading" className="text-2xl font-bold">
              Customer reviews
            </h2>
            {rating !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={rating} />
                <strong>{rating.toFixed(1)} out of 5</strong>
              </div>
            )}
          </div>
          <p className="text-text-muted">
            {reviews.length} verified demo{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <Card
                key={`${review.reviewerName}-${review.date}-${index}`}
                className="p-5"
              >
                <Stars rating={review.rating} />
                <blockquote className="mt-3 text-lg">
                  “{review.comment}”
                </blockquote>
                <p className="mt-5 font-semibold">{review.reviewerName}</p>
                <p className="text-sm text-text-muted">
                  {readableDate(review.date)}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-text-muted">
            This product does not have any reviews yet.
          </Card>
        )}
      </section>

      <ProductScroller
        title="You may also like"
        products={recommendations}
      />
    </PageContainer>
  );
}
