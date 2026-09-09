"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useShop } from "./ShopProvider";
import { categoryLabel, productDepartments } from "./ProductNav";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

const navLinkStyles = "inline-flex min-h-11 items-center px-1 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export default function HeaderNav() {
  const { basket } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileLevel, setMobileLevel] = useState<"main" | "departments" | "category">("main");
  const [departmentIndex, setDepartmentIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setMobileLevel("main");
        setDepartmentIndex(null);
        burgerRef.current?.focus();
      }
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setMobileLevel("main");
        setDepartmentIndex(null);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileLevel("main");
    setDepartmentIndex(null);
  };

  return (
    <nav ref={navRef} aria-label="Account and basket" className="contents text-sm xl:col-start-4 xl:row-start-1 xl:flex xl:items-center xl:justify-self-end xl:gap-8 xl:text-base">
      <div className="hidden items-center gap-8 xl:flex">
        <Link href="/orders" className={navLinkStyles}>Orders</Link>
        <Link href="/favourites" className={navLinkStyles}>Favourites</Link>
      </div>

      <button
        ref={burgerRef}
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onClick={() => {
          setMenuOpen((current) => !current);
          if (menuOpen) {
            setMobileLevel("main");
            setDepartmentIndex(null);
          }
        }}
        className="col-start-1 row-start-1 inline-flex h-11 w-11 justify-self-start items-center justify-center rounded-sm transition hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus xl:hidden"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
          {menuOpen ? <path strokeLinecap="round" d="M5 5l14 14M19 5 5 19" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <Link href="/basket" aria-label={`Basket (${basket.count})`} className="relative col-start-3 row-start-1 inline-flex h-11 w-11 shrink-0 justify-self-end items-center justify-center rounded-sm hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus xl:col-auto xl:row-auto">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" className="h-6 w-6 sm:h-7 sm:w-7">
          <path d="M3 9h18l-2 10H5L3 9z" />
          <path d="M8 9l4-6 4 6" />
        </svg>
        {basket.count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-on-primary">
            {basket.count}
          </span>
        )}
      </Link>

      {menuOpen && (
        <div id="mobile-navigation" className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-7rem)] overflow-y-auto border-y border-border bg-surface px-4 py-4 shadow-card xl:hidden">
          <div className="mx-auto w-full max-w-content">
            {mobileLevel === "main" && (
              <div className="grid">
                <button type="button" onClick={() => setMobileLevel("departments")} className="inline-flex min-h-12 items-center justify-between border-b border-border px-1 text-left font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  Shop <ChevronIcon direction="right" />
                </button>
                <Link href="/orders" onClick={closeMenu} className={`${navLinkStyles} border-b border-border`}>Orders</Link>
                <Link href="/favourites" onClick={closeMenu} className={navLinkStyles}>Favourites</Link>
              </div>
            )}

            {mobileLevel === "departments" && (
              <div>
                <button type="button" onClick={() => setMobileLevel("main")} className="mb-4 inline-flex min-h-12 items-center gap-2 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  <ChevronIcon className="h-5 w-3" />
                  <span>Back to menu</span>
                </button>
                <div className="mb-3 flex items-center justify-between gap-4 border-b border-border pb-4">
                  <h2 className="text-2xl font-bold">Shop</h2>
                  <Link href="/products" onClick={closeMenu} className="font-semibold underline underline-offset-4">Shop all</Link>
                </div>
                <div className="grid">
                  {productDepartments.map((department, index) => (
                    <button
                      key={department.title}
                      type="button"
                      onClick={() => {
                        setDepartmentIndex(index);
                        setMobileLevel("category");
                      }}
                      className="inline-flex min-h-12 items-center justify-between border-b border-border px-1 text-left font-semibold hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    >
                      {department.title} <ChevronIcon direction="right" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mobileLevel === "category" && departmentIndex !== null && (
              <div>
                <button type="button" onClick={() => setMobileLevel("departments")} className="mb-4 inline-flex min-h-12 items-center gap-2 font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                  <ChevronIcon className="h-5 w-3" />
                  <span>Back to departments</span>
                </button>
                <h2 className="mb-3 border-b border-border pb-4 text-2xl font-bold">{productDepartments[departmentIndex].title}</h2>
                <ul className="grid">
                  {productDepartments[departmentIndex].categories.map((category) => (
                    <li key={category} className="border-b border-border">
                      <Link href={`/products?category=${encodeURIComponent(category)}`} onClick={closeMenu} className="inline-flex min-h-12 w-full items-center px-1 text-text-muted hover:bg-surface-muted hover:text-text hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
                        {categoryLabel(category)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
