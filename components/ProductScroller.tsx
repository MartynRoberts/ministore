"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { formatGBP } from "@/utils/money";
import type { Product } from "@/types";

type Props = {
  title: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
};

export default function ProductScroller({
  title,
  products,
  viewAllHref,
  viewAllLabel = "View all",
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollerRef.current.offsetLeft);
    setScrollLeft(scrollerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollerRef.current) return;

    e.preventDefault();

    const x = e.pageX - scrollerRef.current.offsetLeft;
    const walk = x - startX;
    scrollerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="mt-16">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm font-medium underline hover:no-underline"
          >
            {viewAllLabel}
          </Link>
        )}
      </div>

      <div
        ref={scrollerRef}
        className={`flex gap-4 overflow-x-auto pb-2 select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block min-w-[220px] max-w-[220px] shrink-0 overflow-hidden rounded-lg border border-gray-300 text-inherit no-underline transition hover:-translate-y-1 hover:shadow-md"
            draggable={false}
          >
            <div className="aspect-square bg-gray-50 p-4">
              <img
                src={product.image}
                alt={product.title}
                draggable={false}
                className="h-full w-full select-none object-contain"
              />
            </div>

            <div className="p-4">
              <h3 className="min-h-[48px] text-base font-semibold">
                {product.title}
              </h3>
              <p className="mt-2 font-bold">{formatGBP(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}