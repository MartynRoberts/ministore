import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import ProductDetailView from "./ProductDetailView";

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

  const recommendations = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aSameCategory = a.category === product.category ? 1 : 0;
      const bSameCategory = b.category === product.category ? 1 : 0;
      return bSameCategory - aSameCategory;
    })
    .slice(0, 6);

  return (
    <ProductDetailView
      product={product}
      recommendations={recommendations}
    />
  );
}
