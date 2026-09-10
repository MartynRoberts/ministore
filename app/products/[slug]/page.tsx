import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import ProductDetailView from "./ProductDetailView";
import { rankRecommendations } from "@/lib/recommendations";

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

  return (
    <ProductDetailView
      product={product}
      recommendations={recommendations}
    />
  );
}
