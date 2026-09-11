"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatGBP } from "@/utils/money";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { ChevronIcon } from "@/components/ui/ChevronIcon";
import Image from "next/image";

type Props = {
  title: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
};

export default function ProductScroller({ title, products, viewAllHref, viewAllLabel = "View all" }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canPrevious, setCanPrevious] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const updateControls = () => {
    const element = scrollerRef.current;
    if (!element) return;
    setHasOverflow(element.scrollWidth > element.clientWidth + 1);
    setCanPrevious(element.scrollLeft > 1);
    setCanNext(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    );
  };
  useEffect(() => {
    updateControls();
    const observer = new ResizeObserver(updateControls);
    if (scrollerRef.current) observer.observe(scrollerRef.current);
    return () => observer.disconnect();
  }, [products.length]);
  const move = (direction: -1 | 1) =>
    scrollerRef.current?.scrollBy({
      left: direction * scrollerRef.current.clientWidth,
      behavior: "smooth",
    });

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

        <div className="flex items-center gap-2">
          {viewAllHref && <Link href={viewAllHref} className="mr-2 text-sm font-medium underline hover:no-underline">{viewAllLabel}</Link>}
          {hasOverflow && (
            <Button
              variant="secondary"
              size="icon"
              disabled={!canPrevious}
              aria-label={`Previous ${title.toLowerCase()}`}
              onClick={() => move(-1)}
            >
              <ChevronIcon className="h-5 w-5" />
            </Button>
          )}
          {hasOverflow && (
            <Button
              variant="secondary"
              size="icon"
              disabled={!canNext}
              aria-label={`Next ${title.toLowerCase()}`}
              onClick={() => move(1)}
            >
              <ChevronIcon direction="right" className="h-5 w-5" />
            </Button>
          )}
        </div>
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
        onScroll={updateControls}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block min-w-[220px] max-w-[220px] shrink-0 overflow-hidden rounded-lg border border-border bg-surface text-inherit no-underline transition hover:border-focus hover:shadow-card focus-visible:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            draggable={false}
          >
            <div className="aspect-square bg-surface-muted p-4">
              <Image
                src={product.images?.[0] ?? product.image}
                width={440}
                height={440}
                sizes="220px"
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
