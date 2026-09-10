import Link from "next/link";
import type { Product } from "@/types";
import { formatGBP } from "../utils/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Layout";
import { HeartIcon } from "@/components/ui/HeartIcon";
import { getVariants } from "@/lib/basket";

type Props = {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: number) => void;
  onAddToBasket: (id: number, variantId?: string) => void;
};

export default function ProductCard({
  product,
  isFav,
  onToggleFav,
  onAddToBasket,
}: Props) {
  const detailImage = product.images?.[0];
  const responsiveImages = detailImage && detailImage !== product.image
    ? `${product.image} 300w, ${detailImage} 1000w`
    : undefined;

  return (
    <Card className="flex h-full flex-col p-3 transition hover:border-focus hover:shadow-card focus-within:border-focus focus-within:shadow-card">
      <Link
        href={`/products/${product.id}`}
        className="block text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <img
          src={product.image}
          srcSet={responsiveImages}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, calc(100vw - 2rem)"
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-contain"
        />

        <h3 className="my-2 min-h-[48px]">{product.title}</h3>

        <p className="font-bold">{formatGBP(product.price)}</p>
      </Link>
      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={() => onAddToBasket(product.id, getVariants(product)[0].id)}>Add to basket</Button>
        <Button variant="secondary" size="icon" onClick={() => onToggleFav(product.id)} aria-label={isFav ? "Remove from favourites" : "Add to favourites"}>
          <HeartIcon filled={isFav} className={`h-6 w-6 ${isFav ? "text-danger" : "text-text-muted"}`} />
        </Button>
      </div>
    </Card>
  );
}
