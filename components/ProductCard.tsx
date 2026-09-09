import Link from "next/link";
import type { Product } from "@/types";
import { formatGBP } from "../utils/money";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Layout";

type Props = {
  product: Product;
  isFav: boolean;
  onToggleFav: (id: number) => void;
  onAddToBasket: (id: number) => void;
};

export default function ProductCard({
  product,
  isFav,
  onToggleFav,
  onAddToBasket,
}: Props) {
  return (
    <Card className="flex h-full flex-col p-3 transition hover:-translate-y-1 hover:shadow-card">
      <Link
        href={`/products/${product.id}`}
        className="block text-inherit no-underline"
      >
        <img
          src={product.image}
          alt={product.title}
          className="aspect-square w-full object-contain"
        />

        <h3 className="my-2 min-h-[48px]">{product.title}</h3>

        <p className="font-bold">{formatGBP(product.price)}</p>
      </Link>
      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={() => onAddToBasket(product.id)}>Add to basket</Button>
        <Button variant="secondary" size="icon" onClick={() => onToggleFav(product.id)} aria-label={isFav ? "Remove from favourites" : "Add to favourites"}>
          <span aria-hidden="true" className={isFav ? "text-danger" : "text-text-muted"}>{isFav ? "♥" : "♡"}</span>
        </Button>
      </div>
    </Card>
  );
}
