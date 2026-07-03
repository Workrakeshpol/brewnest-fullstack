import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type StatusType =
  | 'completed' | 'processing' | 'cancelled' | 'pending'
  | 'active' | 'inactive'
  | 'confirmed' | 'expired' | 'scheduled'
  | 'published' | 'hidden'
  | 'in-stock' | 'low-stock' | 'out-of-stock';

interface AdminStatusBadgeProps {
  status: StatusType;
  className?: string;
}

const config: Record<StatusType, { label: string; classes: string }> = {
  completed: { label: 'Completed', classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50' },
  processing: { label: 'Processing', classes: 'bg-caramel-100 text-caramel-700 border-caramel-200 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-800/50' },
  pending: { label: 'Pending', classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' },
  active: { label: 'Active', classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50' },
  inactive: { label: 'Inactive', classes: 'bg-surface-hover text-text-muted border-border' },
  confirmed: { label: 'Confirmed', classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50' },
  expired: { label: 'Expired', classes: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' },
  scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50' },
  published: { label: 'Published', classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50' },
  hidden: { label: 'Hidden', classes: 'bg-surface-hover text-text-muted border-border' },
  'in-stock': { label: 'In Stock', classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50' },
  'low-stock': { label: 'Low Stock', classes: 'bg-caramel-100 text-caramel-700 border-caramel-200 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-800/50' },
  'out-of-stock': { label: 'Out of Stock', classes: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' },
};

export default function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const c = config[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', c.classes, className)}>
      {c.label}
    </span>
  );
}
