import { cn } from '../../lib/utils';

export interface CustomizationOption {
  id: string;
  label: string;
  description?: string;
  priceModifier?: number;
}

export interface CustomizationGroup {
  id: string;
  label: string;
  type: 'single' | 'multiple';
  required?: boolean;
  options: CustomizationOption[];
}

interface CustomizationPanelProps {
  groups: CustomizationGroup[];
  selections: Record<string, string[]>;
  onSelectionChange: (groupId: string, optionIds: string[]) => void;
  className?: string;
}

/**
 * CustomizationPanel — interactive options for milk, size, syrups, extras.
 * Supports single-select (radio) and multi-select (checkbox) groups.
 */
export default function CustomizationPanel({
  groups,
  selections,
  onSelectionChange,
  className,
}: CustomizationPanelProps) {
  const toggleOption = (groupId: string, optionId: string, type: 'single' | 'multiple') => {
    const current = selections[groupId] || [];
    if (type === 'single') {
      onSelectionChange(groupId, current.includes(optionId) ? [] : [optionId]);
    } else {
      onSelectionChange(
        groupId,
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {groups.map((group) => (
        <div key={group.id}>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-text">
              {group.label}
            </h3>
            {group.required ? (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Required
              </span>
            ) : (
              <span className="text-xs text-text-muted">Optional</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.options.map((option) => {
              const isSelected = (selections[group.id] || []).includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(group.id, option.id, group.type)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200',
                    isSelected
                      ? 'border-accent bg-caramel-50 dark:bg-caramel-900/20'
                      : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-hover',
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Radio / Checkbox indicator */}
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-all',
                        group.type === 'single' ? 'rounded-full' : 'rounded-md',
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-border',
                      )}
                    >
                      {isSelected && (
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full bg-white',
                            group.type === 'multiple' && 'rounded-sm',
                          )}
                        />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-text">
                        {option.label}
                      </span>
                      {option.description && (
                        <p className="text-xs text-text-muted">{option.description}</p>
                      )}
                    </div>
                  </div>
                  {option.priceModifier ? (
                    <span className="shrink-0 text-sm font-medium text-accent">
                      {option.priceModifier > 0 ? '+' : ''}
                      ${option.priceModifier.toFixed(2)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
