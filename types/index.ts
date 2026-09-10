export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: { width: number; height: number; depth: number };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: { createdAt?: string; updatedAt?: string; barcode?: string; qrCode?: string };
};

export type ProductReview = { rating: number; comment: string; date: string; reviewerName: string };

export type Basket = Record<number, number>; // productId -> qty
