import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import ProductDetailView from "./ProductDetailView";
import { rankRecommendations } from "@/lib/recommendations";
import type { Metadata } from "next";
import { formatGBP } from "@/utils/money";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const id = Number(slug);
  if (!Number.isInteger(id) || id <= 0) return { title: "Product not found", robots: { index: false, follow: false } };
  const product = await api.getProduct(id).catch(() => null);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const title = `${product.title} – ${formatGBP(product.price)}`;
  const description = product.description.slice(0, 160);
  const url = `/products/${product.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, images: [{ url: product.images?.[0] ?? product.image, alt: product.title }] },
    twitter: { card: "summary_large_image", title, description, images: [product.images?.[0] ?? product.image] },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const id = Number(slug);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const product = await api.getProduct(id).catch(() => null);
//await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay can be introduced to see the loading page longer if needed
  if (!product) notFound();

  const allProducts = await api.getProducts();

  const recommendations = rankRecommendations(product, allProducts);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images?.length ? product.images : [product.image],
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: product.price.toFixed(2),
      availability: (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: new URL(`/products/${product.id}`, getSiteUrl()).toString(),
    },
    aggregateRating: product.rating !== undefined && product.reviews?.length ? {
      "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews.length,
    } : undefined,
    review: product.reviews?.map(review => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.reviewerName },
      datePublished: review.date,
      reviewBody: review.comment,
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <ProductDetailView product={product} recommendations={recommendations} />
    </>
  );
}
