import { Link } from 'react-router-dom';
import { Heart, Plus, Check, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import StarRating from './StarRating';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';
import type { MenuItem } from '../../types/menu';

interface ProductCardProps {
  item: MenuItem;
  index?: number;
}

/**
 * ProductCard — responsive card with image, rating, price, description,
 * favorite toggle, add-to-cart, and link to product details.
 */
export default function ProductCard({ item, index = 0 }: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, isInCart } = useCart();
  const favorited = isFavorite(item.id);
  const inCart = isInCart(item.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={`/menu/${item.id}`} className="group block h-full">
        <Card interactive className="flex h-full flex-col">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {item.isPopular && (
                <Badge variant="accent" size="sm">Popular</Badge>
              )}
              {item.isNew && (
                <Badge
                  size="sm"
                  className="bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50"
                >
                  New
                </Badge>
              )}
            </div>
            {/* Favorite */}
            <button
              onClick={handleFavorite}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className={cn(
                'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
                'border',
                favorited
                  ? 'bg-red-500/90 border-red-400 text-white'
                  : 'bg-bg/60 border-border text-text-muted hover:text-red-500 hover:border-red-300',
              )}
            >
              <Heart
                className={cn('h-4 w-4 transition-all', favorited && 'fill-current')}
              />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            {/* Header: name + price */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-lg font-semibold leading-tight text-text group-hover:text-accent transition-colors">
                {item.name}
              </h3>
              <span className="shrink-0 font-serif text-lg font-bold text-accent">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {/* Rating */}
            <div className="mt-2">
              <StarRating
                rating={item.rating}
                size="sm"
                showNumber
                reviewCount={item.reviewCount}
              />
            </div>

            {/* Description */}
            <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-2">
              {item.description}
            </p>

            {/* Meta: prep time + calories */}
            <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {item.prepTime}
              </span>
              {item.calories !== undefined && (
                <span className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  {item.calories} cal
                </span>
              )}
            </div>

            {/* Add to cart */}
            <div className="mt-5 pt-1">
              <button
                onClick={handleAddToCart}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200',
                  inCart
                    ? 'bg-sage-100 text-sage-700 border border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50'
                    : 'bg-espresso-800 text-cream-50 hover:bg-espresso-700 dark:bg-caramel-500 dark:text-espresso-950 dark:hover:bg-caramel-400',
                )}
              >
                {inCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
