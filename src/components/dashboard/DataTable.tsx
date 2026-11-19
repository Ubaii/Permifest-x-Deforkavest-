'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CaretUp, CaretDown, ArrowsDownUp, MagnifyingGlass, FileCsv } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/dashboard/EmptyState';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessor?: (item: T) => any;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchableKeys?: (keyof T | string)[];
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  actionSlot?: React.ReactNode;
  exportFilename?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = 'Cari data...',
  searchableKeys,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  onRowClick,
  emptyTitle = 'Belum ada data',
  emptyDescription = 'Data tidak ditemukan atau belum ada catatan baru.',
  actionSlot,
  exportFilename,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting click
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (searchableKeys && searchableKeys.length > 0) {
        return searchableKeys.some((k) => {
          const val = item[k as string];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
      }
      // Default: search all string/number fields
      return Object.values(item).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery, searchableKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const column = columns.find((c) => c.key === sortKey);

    return [...filteredData].sort((a, b) => {
      let valA = column?.accessor ? column.accessor(a) : a[sortKey];
      let valB = column?.accessor ? column.accessor(b) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB, 'id', { numeric: true });
        return sortDirection === 'asc' ? comp : -comp;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, validCurrentPage, pageSize]);

  // Simple CSV exporter
  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = columns.map((c) => (typeof c.header === 'string' ? c.header : c.key)).join(',');
    const rows = sortedData.map((item) =>
      columns
        .map((c) => {
          const val = columnValueToString(c.accessor ? c.accessor(item) : item[c.key]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFilename || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9 h-10 w-full text-xs sm:text-sm bg-[var(--card)]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {exportFilename && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 h-10 text-xs font-semibold"
            >
              <FileCsv className="w-4 h-4 text-[var(--primary)]" />
              <span>Ekspor CSV</span>
            </Button>
          )}
          {actionSlot}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--accent)]/30 text-[var(--muted-foreground)] font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'py-3.5 px-4 text-xs font-bold uppercase tracking-wider select-none whitespace-nowrap',
                      col.headerClassName
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors group"
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <CaretUp className="w-3.5 h-3.5 text-[var(--primary)]" weight="bold" />
                          ) : (
                            <CaretDown className="w-3.5 h-3.5 text-[var(--primary)]" weight="bold" />
                          )
                        ) : (
                          <ArrowsDownUp className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, rowIdx) => (
                  <tr
                    key={keyExtractor(item)}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors',
                      onRowClick
                        ? 'cursor-pointer hover:bg-[var(--accent)]/50 focus-within:bg-[var(--accent)]/50'
                        : 'hover:bg-[var(--accent)]/25'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${keyExtractor(item)}-${col.key}`}
                        className={cn('py-3.5 px-4 text-[var(--foreground)] align-middle', col.className)}
                      >
                        {col.cell
                          ? col.cell(item, (validCurrentPage - 1) * pageSize + rowIdx)
                          : columnValueToString(col.accessor ? col.accessor(item) : item[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center">
                    <EmptyState
                      title={searchQuery ? 'Pencarian tidak ditemukan' : emptyTitle}
                      description={
                        searchQuery
                          ? `Tidak ada data yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                          : emptyDescription
                      }
                      action={
                        searchQuery ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                          >
                            Reset pencarian
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination Footer */}
        {totalItems > 0 && (
          <div className="border-t border-[var(--border)] px-4 bg-[var(--card)]">
            <Pagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={pageSizeOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function columnValueToString(val: unknown): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  return '';
}
