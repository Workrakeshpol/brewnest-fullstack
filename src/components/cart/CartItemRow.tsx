import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuantitySelector from './QuantitySelector';
import { useCart, type CartItem } from '../../contexts/CartContext';

interface CartItemRowProps {
  item: CartItem;
}

/**
 * CartItemRow — single line item in the cart with image, name,
 * price, quantity controls, and remove button.
 */
export default function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const lineTotal = item.price * item.quantity;

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        layout
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, x: -20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="flex gap-4 border-b border-border py-4 last:border-b-0"
      >
        {/* Image */}
        <Link
          to={`/menu/${item.id}`}
          className="shrink-0 overflow-hidden rounded-xl"
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-20 w-20 object-cover transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24"
          />
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/menu/${item.id}`}
              className="font-serif text-base font-semibold text-text hover:text-accent transition-colors"
            >
              {item.name}
            </Link>
            <button
              onClick={() => removeFromCart(item.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20"
              aria-label={`Remove ${item.name} from cart`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-0.5 text-sm text-text-muted">
            ${item.price.toFixed(2)} each
          </p>

          {/* Bottom row: quantity + line total */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <QuantitySelector
              quantity={item.quantity}
              onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
              onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
              size="sm"
            />
            <div className="text-right">
              <p className="font-serif text-lg font-bold text-text">
                ${lineTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
