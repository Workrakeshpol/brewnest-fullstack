import { cn } from '../../lib/utils';
import type { CategoryId } from '../../types/menu';

interface CategoryTabsProps {
  categories: { id: CategoryId; label: string; icon: string }[];
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

/**
 * CategoryTabs — horizontally scrollable category filter pills.
 */
export default function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 min-w-min">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
              active === cat.id
                ? 'bg-espresso-800 text-cream-50 dark:bg-caramel-500 dark:text-espresso-950'
                : 'border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-hover',
            )}
          >
            <span className="text-base">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
