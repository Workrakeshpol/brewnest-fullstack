import { cn } from '../../lib/utils';

export interface NutritionInfo {
  label: string;
  value: string;
  unit: string;
  percent?: number;
}

interface NutritionPanelProps {
  calories: number;
  servingSize: string;
  nutrients: NutritionInfo[];
  className?: string;
}

/**
 * NutritionPanel — nutrition facts styled like an FDA label.
 */
export default function NutritionPanel({
  calories,
  servingSize,
  nutrients,
  className,
}: NutritionPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface p-6',
        className,
      )}
    >
      <h3 className="font-serif text-xl font-bold text-text">
        Nutrition Facts
      </h3>
      <p className="mt-1 text-xs text-text-muted">{servingSize}</p>

      {/* Calories highlight */}
      <div className="mt-4 flex items-end justify-between border-b-2 border-text py-3">
        <span className="text-sm font-semibold text-text">Calories</span>
        <span className="font-serif text-3xl font-bold text-text">{calories}</span>
      </div>

      {/* Nutrient list */}
      <div className="mt-2 space-y-0">
        {nutrients.map((n, i) => (
          <div
            key={n.label}
            className={cn(
              'flex items-center justify-between border-b border-border py-2 text-sm',
              i === 0 && 'border-b-2 border-text/30',
            )}
          >
            <span className="text-text-muted">{n.label}</span>
            <span className="font-medium text-text">
              {n.value}
              <span className="ml-0.5 text-xs text-text-muted">{n.unit}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Daily value bars */}
      {nutrients.some((n) => n.percent !== undefined) && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            % Daily Value
          </p>
          {nutrients
            .filter((n) => n.percent !== undefined)
            .map((n) => (
              <div key={n.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text-muted">{n.label}</span>
                  <span className="font-medium text-text">{n.percent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-caramel-500 dark:bg-caramel-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, n.percent!)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      <p className="mt-5 text-[10px] leading-relaxed text-text-muted/70">
        Percent Daily Values are based on a 2,000 calorie diet. Actual values
        may vary depending on customizations and preparation.
      </p>
    </div>
  );
}
