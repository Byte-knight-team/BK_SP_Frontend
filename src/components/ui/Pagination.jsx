import React from 'react';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  totalItems,
  startIndex,
  endIndex
}) => {
  if (totalPages === 0) return null;

  // Simple visible page numbers logic (e.g., showing 5 pages around current)
  const getVisiblePageNumbers = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const visiblePageNumbers = getVisiblePageNumbers();
  const firstVisibleNumber = totalItems === 0 ? 0 : startIndex + 1;
  const lastVisibleNumber = Math.min(endIndex, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-500">
          Page <span className="font-semibold text-gray-800">{currentPage}</span> of{' '}
          <span className="font-semibold text-gray-800">{totalPages}</span> • Showing{' '}
          <span className="font-semibold text-gray-800">{firstVisibleNumber}</span>-
          <span className="font-semibold text-gray-800">{lastVisibleNumber}</span> of{' '}
          <span className="font-semibold text-gray-800">{totalItems}</span> items
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-sm text-gray-500">
            Rows:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50 cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RiArrowLeftSLine size={18} />
          Previous
        </button>

        {visiblePageNumbers.map((pageNumber, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => pageNumber !== '...' && onPageChange(pageNumber)}
            disabled={pageNumber === '...'}
            className={`h-9 min-w-9 rounded-xl px-3 text-sm font-bold transition-colors ${
              pageNumber === currentPage
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-100'
                : pageNumber === '...'
                ? 'border-transparent text-gray-500 cursor-default'
                : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <RiArrowRightSLine size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
