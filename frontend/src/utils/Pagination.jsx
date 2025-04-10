import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];

    // Always show first page
    pages.push(1);

    // Current page neighborhood
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in the current range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-9 h-9 flex items-center justify-center text-gray-500"
            >
              &#8230;
            </span>
          ) : (
            <button
              key={`page-${page}`}
              onClick={() => page !== currentPage && onPageChange(page)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-medium transition-colors ${
                currentPage === page
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
