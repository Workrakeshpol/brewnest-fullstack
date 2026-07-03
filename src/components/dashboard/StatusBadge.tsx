import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

type StatusType = 'completed' | 'processing' | 'cancelled' | 'upcoming' | 'unread' | 'read';

interface StatusBadgeProps {
  status: StatusType;
  children?: ReactNode;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  completed: {
    label: 'Completed',
    classes: 'bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50',
  },
  processing: {
    label: 'Processing',
    classes: 'bg-caramel-100 text-caramel-700 border-caramel-200 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-800/50',
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50',
  },
  upcoming: {
    label: 'Upcoming',
    classes: 'bg-caramel-100 text-caramel-700 border-caramel-200 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-800/50',
  },
  unread: {
    label: 'New',
    classes: 'bg-accent text-white border-accent',
  },
  read: {
    label: 'Read',
    classes: 'bg-surface-hover text-text-muted border-border',
  },
};

/**
 * StatusBadge — status pill for orders, reservations, notifications.
 */
export default function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <motion.span
      layout
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className,
      )}
    >
      {children || config.label}
    </motion.span>
  );
}
