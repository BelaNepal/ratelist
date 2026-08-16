import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, safePage - 1);
      let end = Math.min(totalPages - 1, safePage + 1);

      if (safePage <= 3) {
        end = 4;
      } else if (safePage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl ${className}`}>
      {/* Items Counter & Page Size Selector */}
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to{' '}
          <strong className="text-slate-900 font-bold">{endItem}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((num, idx) =>
            typeof num === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(num)}
                className={`h-7 min-w-[28px] px-2 rounded-lg text-xs font-bold transition-all ${
                  safePage === num
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {num}
              </button>
            ) : (
              <span key={idx} className="px-1 text-xs text-slate-400 font-bold">
                {num}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          title="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
