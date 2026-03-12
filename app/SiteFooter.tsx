import Link from "next/link";

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
    <footer className="w-full bg-neutral-800 text-white">
      <div className="mx-auto w-full max-w-[1680px] px-4 py-4 md:py-16">
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
                      className="text-neutral-300 transition hover:text-white"
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
              className="border-b border-neutral-600 py-3 group"
            >
              <summary className="flex items-center justify-between py-2 text-lg font-semibold cursor-pointer">
                {column.title}

                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <ul className="my-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-300 transition hover:text-white"
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