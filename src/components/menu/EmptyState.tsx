import { SearchX } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
}

/**
 * EmptyState — shown when search/filter returns no results.
 */
export default function EmptyState({
  title = 'No items found',
  message = 'Try adjusting your search or filters to find what you\'re looking for.',
  onReset,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-hover">
        <SearchX className="h-10 w-10 text-text-muted" />
      </div>
      <h3 className="mt-6 font-serif text-xl font-semibold text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{message}</p>
      {onReset && (
        <div className="mt-6">
          <Button variant="outline" size="md" onClick={onReset}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
