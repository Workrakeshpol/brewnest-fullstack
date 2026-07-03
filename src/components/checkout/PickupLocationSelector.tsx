import { MapPin, Check, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: string;
  hours: string;
}

interface PickupLocationSelectorProps {
  locations: PickupLocation[];
  selected: string | null;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * PickupLocationSelector — radio list of cafe locations for pickup.
 */
export default function PickupLocationSelector({
  locations,
  selected,
  onChange,
  className,
}: PickupLocationSelectorProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {locations.map((loc, i) => {
        const isActive = selected === loc.id;
        return (
          <motion.button
            key={loc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(loc.id)}
            className={cn(
              'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200',
              isActive
                ? 'border-accent bg-caramel-50 ring-1 ring-accent/30 dark:bg-caramel-900/20'
                : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-hover',
            )}
          >
            {/* Radio */}
            <div
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isActive ? 'border-accent bg-accent' : 'border-border',
              )}
            >
              {isActive && <Check className="h-3 w-3 text-white" />}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="font-serif text-base font-semibold text-text">
                  {loc.name}
                </span>
                <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-text-muted">
                  {loc.distance}
                </span>
              </div>
              <div className="mt-1 flex items-start gap-1.5 text-sm text-text-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {loc.address}<br />{loc.city}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">{loc.hours}</p>
            </div>

            {/* Directions icon */}
            <Navigation
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0 transition-colors',
                isActive ? 'text-accent' : 'text-text-muted',
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
