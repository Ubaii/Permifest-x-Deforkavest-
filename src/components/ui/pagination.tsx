'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = totalItems ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 text-xs sm:text-sm text-[var(--muted-foreground)]',
        className
      )}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {totalItems !== undefined && (
          <p>
            Menampilkan <span className="font-semibold text-[var(--foreground)]">{startItem}-{endItem}</span> dari{' '}
            <span className="font-semibold text-[var(--foreground)]">{totalItems}</span> data
          </p>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Jumlah item per halaman"
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-2 py-1 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex items-center justify-center p-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
        >
          <CaretLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-[var(--muted-foreground)] select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(page);
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Halaman ${pageNum}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors min-h-[44px] min-w-[44px]',
                  isCurrent
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)]'
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Halaman selanjutnya"
          className="inline-flex items-center justify-center p-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px] min-w-[44px]"
        >
          <CaretRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
