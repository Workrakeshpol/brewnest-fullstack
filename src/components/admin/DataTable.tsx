import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) {
  const alignClass = (align?: string) =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-surface shadow-soft', className)}>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-hover/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted',
                    alignClass(col.align),
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-hover/50',
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-5 py-3.5 text-sm text-text',
                        alignClass(col.align),
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-border md:hidden">
        {data.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">{emptyMessage}</div>
        ) : (
          data.map((row) => (
            <div
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-4 px-4 py-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {col.label}
                  </span>
                  <span className="text-sm text-text">
                    {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
