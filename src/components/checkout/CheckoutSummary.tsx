import { motion } from 'framer-motion';
import { Receipt, ShoppingBag } from 'lucide-react';
import DeliveryOptionSelector from '../cart/DeliveryOptionSelector';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

interface CheckoutSummaryProps {
  showDeliveryOptions?: boolean;
  className?: string;
}

/**
 * CheckoutSummary — sticky sidebar showing order breakdown and item list.
 * Compact version of OrderSummary for the checkout page.
 */
export default function CheckoutSummary({
  showDeliveryOptions = false,
  className,
}: CheckoutSummaryProps) {
  const {
    items,
    subtotal,
    discount,
    coupon,
    taxAmount,
    taxRate,
    deliveryFee,
    deliveryType,
    total,
    itemCount,
  } = useCart();

  const rows = [
    { label: `Subtotal (${itemCount})`, value: `$${subtotal.toFixed(2)}` },
    ...(discount > 0
      ? [{ label: `Discount (${coupon?.code})`, value: `−$${discount.toFixed(2)}`, positive: true }]
      : []),
    { label: `Tax (${(taxRate * 100).toFixed(1)}%)`, value: `$${taxAmount.toFixed(2)}` },
    {
      label: deliveryType === 'pickup' ? 'Pickup' : 'Delivery',
      value: deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`,
      positive: deliveryFee === 0,
    },
  ];

  return (
    <div className={cn('rounded-2xl border border-border bg-surface shadow-soft', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border p-5">
        <Receipt className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg font-bold text-text">Order Summary</h3>
        <span className="ml-auto text-xs text-text-muted">{itemCount} items</span>
      </div>

      {/* Delivery options */}
      {showDeliveryOptions && (
        <div className="border-b border-border p-5">
          <DeliveryOptionSelector />
        </div>
      )}

      {/* Items list */}
      <div className="border-b border-border p-5">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-text-muted">
          <ShoppingBag className="h-3.5 w-3.5" />
          Items
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso-800 px-1 text-[10px] font-bold text-cream-50 dark:bg-caramel-500 dark:text-espresso-950">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{item.name}</p>
                <p className="text-xs text-text-muted">
                  ${item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-text">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="p-5">
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-text-muted">{row.label}</span>
              <span
                className={cn(
                  'font-medium',
                  'positive' in row && row.positive
                    ? 'text-sage-600 dark:text-sage-400'
                    : 'text-text',
                )}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-border" />

        <div className="flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-text">Total</span>
          <motion.span
            key={total}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="font-serif text-2xl font-bold text-accent"
          >
            ${total.toFixed(2)}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
