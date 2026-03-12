"use client";

import Link from "next/link";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import SearchBar from "@/components/SearchBar";

type Props = {
  products: Product[];
};

export default function HeaderSearch({ products }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const trimmed = query.trim().toLowerCase();

  const quickResults = useMemo(() => {
    if (!trimmed) return [];

    return products
      .filter((product) => product.title.toLowerCase().includes(trimmed))
      .slice(0, 4);
  }, [products, trimmed]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const search = query.trim();
    if (!search) {
      router.push("/products");
      setIsOpen(false);
      return;
    }

    router.push(`/products?search=${encodeURIComponent(search)}`);
    setIsOpen(false);
  };

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit}>
        <SearchBar
          value={query}
          onChange={(value) => {
            setQuery(value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
        />
      </form>

      {isOpen && trimmed && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          {quickResults.length > 0 ? (
            <>
              <ul className="grid gap-2">
                {quickResults.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-12 w-12 object-contain"
                      />

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-3 border-t border-gray-100 pt-3">
                <button
                  type="submit"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  See all results for “{query.trim()}”
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              No quick results found for “{query.trim()}”
            </div>
          )}
        </div>
      )}
    </div>
  );
}