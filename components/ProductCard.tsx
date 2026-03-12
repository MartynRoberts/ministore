import Link from "next/link";
import type { Product } from "@/types";
import { formatGBP } from "../utils/money";

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
    <div className="border border-gray-300 rounded-lg p-3">
      <Link
        href={`/products/${product.id}`}
        className="block text-inherit no-underline"
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-[380px] h-[380px] object-contain"
        />

        <h3 className="my-2 min-h-[48px]">{product.title}</h3>

        <p>{formatGBP(product.price)}</p>
      </Link>
    </div>
  );
}