import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  interactive?: boolean;
  glass?: boolean;
  className?: string;
}

/**
 * Card — surface container with border, shadow, and rounded corners.
 * Set `interactive` for hover lift + shadow animation.
 */
export function Card({
  children,
  interactive = false,
  glass,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface shadow-soft',
        interactive &&
          'transition-all duration-300 hover:shadow-card hover:-translate-y-1',
        glass && 'glass-panel',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
