import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination — numbered page controls with prev/next arrows.
 * Shows up to 5 page numbers with ellipsis for large ranges.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
          currentPage === 1
            ? 'border-border text-text-muted/40 cursor-not-allowed'
            : 'border-border text-text hover:bg-surface-hover',
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-10 w-10 items-center justify-center text-text-muted"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={cn(
              'flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-espresso-800 text-cream-50 dark:bg-caramel-500 dark:text-espresso-950'
                : 'border border-border text-text hover:bg-surface-hover',
            )}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border transition-colors',
          currentPage === totalPages
            ? 'border-border text-text-muted/40 cursor-not-allowed'
            : 'border-border text-text hover:bg-surface-hover',
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
