import Link from "next/link";
import { ChevronIcon } from "@/components/ui/ChevronIcon";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "New arrivals", href: "#" },
      { label: "Best sellers", href: "#" },
      { label: "Gift cards", href: "#" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact us", href: "#" },
      { label: "Delivery", href: "#" },
      { label: "Returns", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our story", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Sustainability", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="w-full bg-primary text-on-primary">
      <div className="mx-auto w-full max-w-content px-4 py-4 md:py-16">
        {/* Desktop / tablet */}
        <div className="hidden md:grid md:grid-cols-4 md:gap-16">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-lg font-semibold">{column.title}</h3>

              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="opacity-80 transition hover:opacity-100 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden">
          {footerColumns.map((column) => (
            <details
              key={column.title}
              className="group border-b border-border/40 py-3"
            >
              <summary className="flex items-center justify-between py-2 text-lg font-semibold cursor-pointer">
                {column.title}

                <ChevronIcon direction="down" className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>

              <ul className="my-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="opacity-80 transition hover:opacity-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </footer>
  );
}
