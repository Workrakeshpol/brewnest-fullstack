import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SortOption } from '../../types/menu';

interface MenuToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  resultCount: number;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-az', label: 'Name: A to Z' },
  { value: 'name-za', label: 'Name: Z to A' },
];

/**
 * MenuToolbar — search bar + sort dropdown + result count.
 */
export default function MenuToolbar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  resultCount,
}: MenuToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search menu items..."
          className={cn(
            'h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm text-text',
            'placeholder:text-text-muted/60',
            'focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors duration-200 outline-none',
          )}
        />
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-text-muted sm:inline whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'item' : 'items'}
        </span>
        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={cn(
              'h-11 appearance-none rounded-full border border-border bg-surface pl-10 pr-9 text-sm font-medium text-text',
              'focus:border-accent focus:ring-1 focus:ring-accent outline-none',
              'transition-colors duration-200 cursor-pointer',
            )}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        </div>
      </div>
    </div>
  );
}
