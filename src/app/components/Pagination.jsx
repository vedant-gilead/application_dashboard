import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange
}) {
  const goToPage = (page) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Info */}
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
          <span className="font-semibold text-gray-900">
            {Math.min(endIndex, totalItems)}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalItems}</span> results
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-gray-700"
          >
            Previous
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && goToPage(page)}
              disabled={page === "..."}
              className={`
                min-w-[2.5rem] px-3.5 py-2 text-sm font-medium border rounded-lg transition-all duration-200
                ${
                  page === currentPage
                    ? "bg-[#c5203f] text-white border-[#c5203f] shadow-sm"
                    : page === "..."
                    ? "border-transparent cursor-default text-gray-400"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }
              `}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 text-gray-700"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
