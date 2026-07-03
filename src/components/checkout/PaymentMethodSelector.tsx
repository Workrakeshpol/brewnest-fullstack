import { CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';

export type PaymentMethod = 'card' | 'apple-pay' | 'google-pay' | 'cash';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  className?: string;
}

const methods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
  badge?: string;
}[] = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Amex',
    icon: CreditCard,
    badge: 'Secure',
  },
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    description: 'Pay with Touch ID',
    icon: Smartphone,
  },
  {
    id: 'google-pay',
    label: 'Google Pay',
    description: 'Pay with your Google account',
    icon: Wallet,
  },
  {
    id: 'cash',
    label: 'Cash on Pickup',
    description: 'Pay at the counter',
    icon: Banknote,
  },
];

/**
 * PaymentMethodSelector — radio group for choosing payment type.
 */
export default function PaymentMethodSelector({
  selected,
  onChange,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>
      {methods.map((method) => {
        const isActive = selected === method.id;
        return (
          <button
            key={method.id}
            onClick={() => onChange(method.id)}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200',
              isActive
                ? 'border-accent bg-caramel-50 ring-1 ring-accent/30 dark:bg-caramel-900/20'
                : 'border-border bg-surface hover:border-accent/40 hover:bg-surface-hover',
            )}
          >
            {/* Radio indicator */}
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                isActive ? 'border-accent bg-accent' : 'border-border',
              )}
            >
              {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                isActive
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-text-muted',
              )}
            >
              <method.icon className="h-5 w-5" />
            </div>

            {/* Label */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text">{method.label}</span>
                {method.badge && (
                  <span className="rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700 dark:bg-sage-800/40 dark:text-sage-300">
                    {method.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">{method.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
