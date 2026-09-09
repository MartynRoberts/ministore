type PaginationProps = {
  page: number;
  totalPages: number;
  updateParam: (
    key: string,
    value?: string,
    options?: { replace?: boolean }
  ) => void;
};

export default function Pagination({
  page,
  totalPages,
  updateParam,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const changePage = (n: number) => {
    if (n >= 1 && n <= totalPages) {
      updateParam("page", String(n));
    }
  };

  const getVisiblePages = (): Array<number | "..."> => {
    const pages: Array<number | "..."> = [];

    const delta = 1;

    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);

    pages.push(1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() => changePage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        Prev
      </Button>

      {visiblePages.map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <Button
            variant={page === item ? "primary" : "secondary"}
            size="sm"
            type="button"
            key={item}
            onClick={() => changePage(item)}
            aria-current={page === item ? "page" : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </Button>
        )
      )}

      <Button
        variant="secondary"
        size="sm"
        type="button"
        onClick={() => changePage(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        Next
      </Button>
    </nav>
  );
}
import { Button } from "@/components/ui/Button";
