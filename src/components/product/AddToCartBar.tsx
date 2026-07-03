import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AddToCartBarProps {
  quantity: number;
  onQuantityChange: (q: number) => void;
  onAddToCart: () => void;
  unitPrice: number;
  justAdded?: boolean;
  className?: string;
}

/**
 * AddToCartBar — sticky bottom bar with quantity selector and add-to-cart.
 * Shows a success animation when item is added.
 */
export default function AddToCartBar({
  quantity,
  onQuantityChange,
  onAddToCart,
  unitPrice,
  justAdded,
  className,
}: AddToCartBarProps) {
  const totalPrice = unitPrice * quantity;

  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-lg',
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        {/* Quantity selector */}
        <div className="flex items-center gap-1 rounded-full border border-border bg-bg p-1">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <span className="text-lg leading-none">−</span>
          </button>
          <span className="w-8 text-center font-serif text-lg font-bold text-text">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover"
            aria-label="Increase quantity"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>

        {/* Price display */}
        <div className="hidden flex-col sm:flex">
          <span className="text-xs text-text-muted">Total</span>
          <span className="font-serif text-lg font-bold text-text">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={onAddToCart}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300',
            justAdded
              ? 'bg-sage-500 text-white'
              : 'bg-espresso-800 text-cream-50 hover:bg-espresso-700 dark:bg-caramel-500 dark:text-espresso-950 dark:hover:bg-caramel-400',
          )}
        >
          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Added to Cart!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart · ${totalPrice.toFixed(2)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
