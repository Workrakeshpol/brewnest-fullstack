import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import StarRating from '../menu/StarRating';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';
import type { MenuItem } from '../../types/menu';

interface WishlistItemCardProps {
  item: MenuItem;
  index?: number;
}

/**
 * WishlistItemCard — compact card for wishlist items with
 * move-to-cart and remove-from-wishlist actions.
 */
export default function WishlistItemCard({
  item,
  index = 0,
}: WishlistItemCardProps) {
  const { toggleFavorite } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(item.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/menu/${item.id}`} className="group block h-full">
        <Card interactive className="flex h-full flex-col sm:flex-row">
          {/* Image */}
          <div className="relative aspect-[4/3] shrink-0 overflow-hidden sm:aspect-square sm:w-32">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {item.isPopular && (
              <div className="absolute left-2 top-2">
                <Badge variant="accent" size="sm">Popular</Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-base font-semibold leading-tight text-text group-hover:text-accent transition-colors">
                {item.name}
              </h3>
              <span className="shrink-0 font-serif text-lg font-bold text-accent">
                ${item.price.toFixed(2)}
              </span>
            </div>

            <div className="mt-1.5">
              <StarRating rating={item.rating} size="sm" showNumber reviewCount={item.reviewCount} />
            </div>

            <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">
              {item.description}
            </p>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-2 pt-4">
              <button
                onClick={handleAddToCart}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  inCart
                    ? 'bg-sage-100 text-sage-700 border border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50'
                    : 'bg-espresso-800 text-cream-50 hover:bg-espresso-700 dark:bg-caramel-500 dark:text-espresso-950 dark:hover:bg-caramel-400',
                )}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    In Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleRemove}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
                aria-label={`Remove ${item.name} from wishlist`}
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
