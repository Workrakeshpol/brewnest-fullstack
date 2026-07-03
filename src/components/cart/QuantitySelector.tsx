import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * QuantitySelector — reusable +/- stepper for cart items.
 */
export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = size === 'sm' ? 'text-sm' : 'text-lg';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border border-border bg-bg p-1',
        className,
      )}
    >
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className={cn(
          'flex items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover',
          'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          btnSize,
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>
      <span
        className={cn(
          'min-w-8 text-center font-serif font-bold text-text',
          textSize,
        )}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className={cn(
          'flex items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover',
          btnSize,
        )}
        aria-label="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}
