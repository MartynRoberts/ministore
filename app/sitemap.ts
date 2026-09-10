import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const products = await api.getProducts();
  const categories = Array.from(new Set(products.map(product => product.category)));
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map(category => ({
      url: `${baseUrl}/products?category=${encodeURIComponent(category)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map(product => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.meta?.updatedAt ? new Date(product.meta.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.images?.length ? product.images : [product.image],
    })),
  ];
}
