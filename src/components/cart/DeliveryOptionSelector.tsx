import { Store, Bike } from 'lucide-react';
import { useCart, type DeliveryType } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

interface DeliveryOptionSelectorProps {
  className?: string;
}

const options: {
  type: DeliveryType;
  label: string;
  description: string;
  icon: typeof Store;
}[] = [
  {
    type: 'pickup',
    label: 'Pickup',
    description: 'Ready in 15 min · Free',
    icon: Store,
  },
  {
    type: 'delivery',
    label: 'Delivery',
    description: '30–45 min · $3.50',
    icon: Bike,
  },
];

/**
 * DeliveryOptionSelector — toggle between pickup and delivery.
 */
export default function DeliveryOptionSelector({
  className,
}: DeliveryOptionSelectorProps) {
  const { deliveryType, setDeliveryType } = useCart();

  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {options.map((opt) => {
        const isActive = deliveryType === opt.type;
        return (
          <button
            key={opt.type}
            onClick={() => setDeliveryType(opt.type)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-200',
              isActive
                ? 'border-accent bg-caramel-50 dark:bg-caramel-900/20 ring-1 ring-accent/30'
                : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-hover',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-text-muted',
              )}
            >
              <opt.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{opt.label}</p>
              <p className="text-xs text-text-muted">{opt.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
