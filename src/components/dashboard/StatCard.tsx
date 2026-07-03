import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: 'caramel' | 'sage' | 'espresso';
  index?: number;
}

const accentMap = {
  caramel: 'bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300',
  sage: 'bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300',
  espresso: 'bg-espresso-100 text-espresso-700 dark:bg-espresso-800/40 dark:text-espresso-200',
};

/**
 * StatCard — compact metric card with icon, value, and label.
 */
export default function StatCard({
  icon,
  label,
  value,
  sublabel,
  accent = 'caramel',
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accentMap[accent])}>
          {icon}
        </div>
        {sublabel && (
          <span className="text-xs font-medium text-text-muted">{sublabel}</span>
        )}
      </div>
      <p className="mt-4 font-serif text-2xl font-bold text-text">{value}</p>
      <p className="mt-0.5 text-sm text-text-muted">{label}</p>
    </motion.div>
  );
}
