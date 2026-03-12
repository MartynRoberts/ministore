type PaginationProps = {
  page: number;
  totalPages: number;
  updateParam: (key: string, value?: string, options?: { replace?: boolean }) => void;
};

export default function Pagination({ page, totalPages, updateParam }: PaginationProps) {
  if (totalPages <= 1) return null;

  const changePage = (n) => {
    if (n >= 1 && n <= totalPages) {
      updateParam("page", String(n));
    }
  };

  const getVisiblePages = () => {
    const pages = [];

    const delta = 1; // how many pages around current

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
    <nav aria-label="Pagination" className="flex gap-2 items-center mt-4">
      {/* PREV */}
      <button 
        type="button"
        onClick={() => changePage(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        Prev
      </button>

      {visiblePages.map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`}>...</span>
        ) : (
          <button
            type="button"
            key={item}
            onClick={() => changePage(item)}
            aria-current={page === item ? "page" : undefined}
            aria-label="Next page"
            className={page === item ? "font-bold" : "font-normal"}
          >
            {item}
          </button>
        )
      )}

      {/* NEXT */}
      <button 
        type="button"
        onClick={() => changePage(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </nav>
  );
}