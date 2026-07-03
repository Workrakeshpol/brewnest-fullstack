import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  accent?: 'caramel' | 'sage' | 'espresso' | 'blue';
  index?: number;
}

const accentMap = {
  caramel: 'bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300',
  sage: 'bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300',
  espresso: 'bg-espresso-100 text-espresso-700 dark:bg-espresso-800/40 dark:text-espresso-200',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
};

export default function AdminStatCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  accent = 'caramel',
  index = 0,
}: AdminStatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accentMap[accent])}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              isPositive
                ? 'bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300'
                : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="mt-4 font-serif text-2xl font-bold text-text">{value}</p>
      <p className="mt-0.5 text-sm text-text-muted">{label}</p>
      {changeLabel && (
        <p className="mt-1 text-xs text-text-muted/70">{changeLabel}</p>
      )}
    </motion.div>
  );
}
