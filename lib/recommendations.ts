import type { Product } from "@/types";

function normalizedTags(product: Product) {
  return new Set((product.tags ?? []).map(tag => tag.trim().toLowerCase()).filter(Boolean));
}

/** Rank related products using normalized catalogue data with deterministic ties. */
export function rankRecommendations(product: Product, catalogue: Product[], limit = 6): Product[] {
  const sourceTags = normalizedTags(product);
  const sourceBrand = product.brand?.trim().toLowerCase();

  return catalogue
    .filter(candidate => candidate.id !== product.id)
    .map(candidate => {
      const sharedTags = [...normalizedTags(candidate)].filter(tag => sourceTags.has(tag)).length;
      const sameCategory = candidate.category === product.category;
      const sameBrand = Boolean(sourceBrand && candidate.brand?.trim().toLowerCase() === sourceBrand);
      const available = candidate.stock === undefined || candidate.stock > 0;
      const rating = candidate.rating ?? 0;
      return { candidate, score: sharedTags * 100 + Number(sameCategory) * 40 + Number(sameBrand) * 20 + Number(available) * 5 + rating };
    })
    .sort((a, b) => b.score - a.score || a.candidate.id - b.candidate.id)
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
