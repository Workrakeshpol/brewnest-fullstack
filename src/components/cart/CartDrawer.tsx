import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Receipt, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import CartItemRow from './CartItemRow';
import OrderSummary from './OrderSummary';
import { cn } from '../../lib/utils';

export default function CartDrawer() {
  const { cartOpen, setCartOpen, items, itemCount, clearCart, subtotal } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close drawer on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    if (cartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [cartOpen, setCartOpen]);

  // Click outside drawer to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      setCartOpen(false);
    }
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 bg-espresso-950/40 backdrop-blur-sm"
          >
            {/* Drawer Container */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 flex h-full w-full flex-col border-l border-border bg-bg shadow-elevated sm:max-w-md"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                  <span className="font-serif text-lg font-bold text-text">
                    Your Cart ({itemCount})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1 text-xs text-text-muted hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setCartOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                    aria-label="Close cart drawer"
                  >
                    <X className="h-4 w-4 text-text" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-espresso-50 text-text-muted dark:bg-espresso-900/40">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-semibold text-text">
                      Your cart is empty
                    </h3>
                    <p className="mt-2 text-sm text-text-muted max-w-xs">
                      Sip, sit, and explore our menu to find your next handcrafted brew.
                    </p>
                    <button
                      onClick={() => {
                        setCartOpen(false);
                        navigate('/menu');
                      }}
                      className="mt-6 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors cursor-pointer"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
                      {items.map((item) => (
                        <CartItemRow key={item.id} item={item} />
                      ))}
                    </div>

                    {/* Delivery / Financial summary inside the drawer */}
                    <OrderSummary
                      showDeliveryOptions={true}
                      showCoupon={true}
                      ctaLabel="Proceed to Checkout"
                      onCtaClick={handleCheckoutClick}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
