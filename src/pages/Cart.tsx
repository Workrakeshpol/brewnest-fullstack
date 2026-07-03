import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CartItemRow from '../components/cart/CartItemRow';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyState from '../components/cart/EmptyState';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { items, itemCount, clearCart, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <Section padding="lg" className="pt-32">
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12 text-text-muted" />}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet. Explore our menu and find your next favorite cup."
          ctaLabel="Browse the Menu"
          ctaTo="/menu"
        />
      </Section>
    );
  }

  return (
    <>
      {/* ── Header ───────────────────────────────────────────── */}
      <Section padding="none" className="pt-28 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="accent" size="md" className="mb-3">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
            <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">
              Your Cart
            </h1>
            <p className="mt-2 text-text-muted">
              Review your selections before checking out.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </Section>

      {/* ── Cart content ─────────────────────────────────────── */}
      <Section padding="none" className="pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: items list */}
          <div className="lg:col-span-2">
            <motion.div
              layout
              className="rounded-2xl border border-border bg-surface shadow-soft px-5 sm:px-6"
            >
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </motion.div>

            {/* Free delivery progress */}
            <FreeDeliveryProgress subtotal={subtotal} />
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                ctaLabel="Proceed to Checkout"
                ctaTo="/checkout"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ── Free delivery progress bar ────────────────────────────── */
function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const threshold = 25;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 rounded-2xl border border-border bg-caramel-50 p-5 dark:bg-caramel-900/10"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text">
          {remaining > 0 ? (
            <>Add <span className="font-bold text-accent">${remaining.toFixed(2)}</span> for free delivery</>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-sage-600 dark:text-sage-400">
              🎉 You've unlocked free delivery!
            </span>
          )}
        </span>
        <span className="text-xs text-text-muted">${subtotal.toFixed(2)} / ${threshold.toFixed(2)}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-caramel-400 to-caramel-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
