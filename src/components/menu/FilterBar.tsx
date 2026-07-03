import { cn } from '../../lib/utils';
import type { FilterTag } from '../../types/menu';

interface FilterBarProps {
  availableTags: FilterTag[];
  activeTags: FilterTag[];
  onToggleTag: (tag: FilterTag) => void;
  onClearAll: () => void;
}

const tagLabels: Record<FilterTag, string> = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  'gluten-free': 'Gluten-Free',
  'sugar-free': 'Sugar-Free',
  hot: 'Hot',
  iced: 'Iced',
  signature: 'Signature',
  seasonal: 'Seasonal',
};

/**
 * FilterBar — toggleable dietary/preference filter chips.
 */
export default function FilterBar({
  availableTags,
  activeTags,
  onToggleTag,
  onClearAll,
}: FilterBarProps) {
  if (availableTags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
        Filter:
      </span>
      {availableTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onToggleTag(tag)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200',
            activeTags.includes(tag)
              ? 'bg-caramel-100 text-caramel-700 border border-caramel-300 dark:bg-caramel-900/30 dark:text-caramel-300 dark:border-caramel-700/50'
              : 'border border-border bg-surface text-text-muted hover:text-text hover:bg-surface-hover',
          )}
        >
          {tagLabels[tag]}
        </button>
      ))}
      {activeTags.length > 0 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-accent hover:underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
