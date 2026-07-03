import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Receipt } from 'lucide-react';
import Button from '../ui/Button';
import CouponInput from './CouponInput';
import DeliveryOptionSelector from './DeliveryOptionSelector';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

interface OrderSummaryProps {
  showDeliveryOptions?: boolean;
  showCoupon?: boolean;
  ctaLabel?: string | null;
  ctaTo?: string;
  onCtaClick?: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * OrderSummary — reusable order breakdown with subtotal, discount,
 * tax, delivery fee, and total. Includes coupon and delivery options.
 */
export default function OrderSummary({
  showDeliveryOptions = true,
  showCoupon = true,
  ctaLabel = 'Proceed to Checkout',
  ctaTo,
  onCtaClick,
  className,
  compact = false,
}: OrderSummaryProps) {
  const {
    subtotal,
    discount,
    taxAmount,
    taxRate,
    deliveryFee,
    deliveryType,
    total,
    itemCount,
    coupon,
  } = useCart();

  const rows = [
    { label: `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`, value: `$${subtotal.toFixed(2)}` },
    ...(discount > 0
      ? [{ label: `Discount${coupon ? ` (${coupon.code})` : ''}`, value: `−$${discount.toFixed(2)}`, highlight: true }]
      : []),
    { label: `Tax (${(taxRate * 100).toFixed(1)}%)`, value: `$${taxAmount.toFixed(2)}` },
    {
      label: deliveryType === 'pickup' ? 'Pickup' : 'Delivery',
      value: deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`,
      highlight: deliveryFee === 0,
    },
  ];

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-surface shadow-soft',
        compact ? 'p-5' : 'p-6',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Receipt className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-lg font-bold text-text">Order Summary</h3>
      </div>

      {/* Delivery options */}
      {showDeliveryOptions && (
        <div className="mt-4">
          <DeliveryOptionSelector />
        </div>
      )}

      {/* Coupon */}
      {showCoupon && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            Promo Code
          </p>
          <CouponInput />
        </div>
      )}

      {/* Price breakdown */}
      <div className="mt-5 space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-text-muted">{row.label}</span>
            <span
              className={cn(
                'font-medium',
                row.highlight ? 'text-sage-600 dark:text-sage-400' : 'text-text',
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-dashed border-border" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="font-serif text-lg font-bold text-text">Total</span>
        <motion.span
          key={total}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-serif text-2xl font-bold text-accent"
        >
          ${total.toFixed(2)}
        </motion.span>
      </div>

      {/* CTA */}
      {ctaLabel && (ctaTo || onCtaClick) && (
        <div className="mt-5">
          {ctaTo ? (
            <Button to={ctaTo} variant="primary" size="lg" fullWidth rightIcon={<ArrowRight className="h-5 w-5" />}>
              {ctaLabel}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onCtaClick}
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              {ctaLabel}
            </Button>
          )}
        </div>
      )}

      {/* Trust badges */}
      {!compact && (
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5" />
            Secure checkout
          </span>
        </div>
      )}
    </div>
  );
}
