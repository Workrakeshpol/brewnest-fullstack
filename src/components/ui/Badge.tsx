import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'accent' | 'muted';
type BadgeSize = 'sm' | 'md';

const variantMap: Record<BadgeVariant, string> = {
  default: 'bg-surface-hover text-text border-border',
  accent:
    'bg-caramel-100 text-caramel-700 border-caramel-200 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-800/50',
  muted:
    'bg-espresso-100 text-espresso-700 border-espresso-200 dark:bg-espresso-800/40 dark:text-espresso-200 dark:border-espresso-700/50',
};

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3.5 py-1 text-xs',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

/**
 * Badge — small pill-shaped label for tags, categories, and status.
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        variantMap[variant],
        sizeMap[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
