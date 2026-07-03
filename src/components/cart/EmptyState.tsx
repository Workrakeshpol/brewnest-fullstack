import type { ReactNode } from 'react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  ctaLabel: string;
  ctaTo: string;
}

/**
 * EmptyState — reusable empty state for cart and wishlist.
 */
export default function EmptyState({
  icon,
  title,
  message,
  ctaLabel,
  ctaTo,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center sm:py-28">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-hover">
        {icon}
      </div>
      <h2 className="mt-6 font-serif text-2xl font-bold text-text sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-base text-text-muted">{message}</p>
      <div className="mt-8">
        <Button to={ctaTo} variant="primary" size="lg">
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
