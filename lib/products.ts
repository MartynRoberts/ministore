import type { Product } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function optionalNumber(value: unknown, min = 0, max = Number.POSITIVE_INFINITY) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;
}
function optionalText(value: unknown) {
  return isText(value) ? value.trim() : undefined;
}

/** Translate provider payloads into the stable model used by the shop. */
export function normalizeProduct(value: unknown): Product {
  if (!isRecord(value)) throw new Error("Invalid product");
  const image = isText(value.thumbnail)
    ? value.thumbnail
    : Array.isArray(value.images) ? value.images.find(isText) : undefined;
  if (
    typeof value.id !== "number" || !Number.isSafeInteger(value.id) || value.id <= 0 ||
    !isText(value.title) || !isText(value.category) ||
    typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0 ||
    !isText(image)
  ) throw new Error("Invalid product fields");
  const gallery = Array.isArray(value.images) ? value.images.filter(isText) : [];
  const dimensions = isRecord(value.dimensions) && [value.dimensions.width, value.dimensions.height, value.dimensions.depth].every(item => optionalNumber(item) !== undefined)
    ? { width: value.dimensions.width as number, height: value.dimensions.height as number, depth: value.dimensions.depth as number }
    : undefined;
  const reviews = Array.isArray(value.reviews) ? value.reviews.flatMap(review => {
    if (!isRecord(review)) return [];
    const rating = optionalNumber(review.rating, 0, 5);
    const comment = optionalText(review.comment);
    const date = optionalText(review.date);
    const reviewerName = optionalText(review.reviewerName);
    return rating !== undefined && comment && date && reviewerName ? [{ rating, comment, date, reviewerName }] : [];
  }) : undefined;
  const meta = isRecord(value.meta) ? {
    createdAt: optionalText(value.meta.createdAt), updatedAt: optionalText(value.meta.updatedAt),
    barcode: optionalText(value.meta.barcode), qrCode: optionalText(value.meta.qrCode),
  } : undefined;
  return {
    id: value.id,
    title: value.title.trim(),
    description: typeof value.description === "string" ? value.description : "",
    price: value.price,
    category: value.category,
    image,
    images: Array.from(new Set(gallery.length ? gallery : [image])),
    discountPercentage: optionalNumber(value.discountPercentage, 0, 100),
    rating: optionalNumber(value.rating, 0, 5),
    stock: optionalNumber(value.stock, 0),
    tags: Array.isArray(value.tags) ? value.tags.filter(isText).map(tag => tag.trim()) : undefined,
    brand: optionalText(value.brand), sku: optionalText(value.sku),
    weight: optionalNumber(value.weight, 0), dimensions,
    warrantyInformation: optionalText(value.warrantyInformation),
    shippingInformation: optionalText(value.shippingInformation),
    availabilityStatus: optionalText(value.availabilityStatus),
    reviews, returnPolicy: optionalText(value.returnPolicy),
    minimumOrderQuantity: optionalNumber(value.minimumOrderQuantity, 1), meta,
  };
}

export function normalizeProducts(value: unknown): Product[] {
  if (!isRecord(value) || !Array.isArray(value.products)) {
    throw new Error("Invalid product catalogue");
  }
  return value.products.map(normalizeProduct);
}
