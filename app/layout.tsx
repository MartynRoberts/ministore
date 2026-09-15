import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ShopProvider } from "./ShopProvider";
import { getShopSession } from "@/app/actions/shop";
import HeaderNav from "./HeaderNav";
import SiteFooter from "./SiteFooter";
import HeaderSearch from "./HeaderSearch";
import { BrandLogo } from "@/components/ui/BrandLogo";
import ProductNav from "./ProductNav";
import { getSiteUrl } from "@/lib/site-url";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import BackToTopButton from "@/components/BackToTopButton";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Mini Store | Ecommerce Portfolio Demo",
    template: "%s | Mini Store",
  },
  description: "Explore Mini Store, a full-stack ecommerce portfolio project with product discovery, favourites, basket, checkout, inventory reservations and order management.",
  applicationName: "Mini Store",
  keywords: ["ecommerce demo", "online store", "Next.js portfolio", "Mini Store"],
  authors: [{ name: "Martyn Roberts" }],
  creator: "Martyn Roberts",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Mini Store",
    title: "Mini Store | Ecommerce Portfolio Demo",
    description: "A full-stack ecommerce portfolio experience with product discovery, checkout and order management.",
    url: "/",
    images: [{ url: "/home-hero.jpg", width: 1920, height: 1080, alt: "Mini Store ecommerce demo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mini Store | Ecommerce Portfolio Demo",
    description: "A full-stack ecommerce portfolio experience with product discovery, checkout and order management.",
    images: ["/home-hero.jpg"],
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    title: "Mini Store",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getShopSession();

  return (
    <html lang="en">
      <body className="bg-canvas text-text">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-md bg-primary px-4 py-3 font-semibold text-on-primary transition-transform focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-focus motion-reduce:transition-none"
        >
          Skip to main content
        </a>
        <UmamiAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Mini Store",
              url: getSiteUrl(),
            }).replace(/</g, "\\u003c"),
          }}
        />
        <ShopProvider initialSession={session}>
          <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
              <div className="mx-auto grid w-full max-w-content grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-4 px-4 py-5 sm:gap-x-8 xl:grid-cols-[auto_auto_minmax(16rem,36rem)_minmax(0,1fr)] xl:gap-x-16 xl:py-6">
                <Link
                  href="/"
                  aria-label="MiniStore home"
                  className="col-start-2 row-start-1 inline-flex shrink-0 -translate-y-[3px] justify-self-center self-center text-text no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus xl:col-start-1 xl:mr-4 xl:justify-self-start"
                >
                  <BrandLogo />
                </Link>

                <ProductNav />

                <HeaderSearch />

                <HeaderNav />
              </div>
            </header>

            <main id="main-content" className="w-full flex-1">{children}</main>

            <SiteFooter />
            <BackToTopButton />
          </div>
        </ShopProvider>
      </body>
    </html>
  );
}
