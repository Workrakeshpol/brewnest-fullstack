import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Clock,
  Flame,
  Leaf,
  Award,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
} from 'lucide-react';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import StarRating from '../components/menu/StarRating';
import ProductCard from '../components/menu/ProductCard';
import ImageGallery from '../components/product/ImageGallery';
import NutritionPanel from '../components/product/NutritionPanel';
import CustomizationPanel from '../components/product/CustomizationPanel';
import ReviewsSection from '../components/product/ReviewsSection';
import AddToCartBar from '../components/product/AddToCartBar';
import { menuItems as localItems } from '../data/menuData';
import { getProductDetail } from '../data/productDetails';
import { productsApi, reviewsApi } from '../lib/api';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';
import type { MenuItem } from '../types/menu';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [customSelections, setCustomSelections] = useState<Record<string, string[]>>({});
  const [justAdded, setJustAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'nutrition' | 'reviews'>('description');
  const [apiItem, setApiItem] = useState<MenuItem | null>(null);
  const [apiRelated, setApiRelated] = useState<MenuItem[]>([]);
  const [apiReviews, setApiReviews] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch product from API (fallback to local data) ─────────
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await productsApi.get(id);
      if (data) {
        const mapped: MenuItem = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          longDescription: data.long_description || data.description || '',
          price: parseFloat(data.price),
          image: data.image,
          category: data.category,
          rating: parseFloat(data.rating) || 0,
          reviewCount: data.review_count || 0,
          calories: data.calories,
          prepTime: data.prep_time || '5 min',
          tags: Array.isArray(data.tags) ? data.tags : [],
          ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
          isPopular: data.is_popular || false,
          isNew: data.is_new || false,
        };
        setApiItem(mapped);

        // Map related products
        if (data.related && Array.isArray(data.related)) {
          setApiRelated(data.related.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            longDescription: p.long_description || '',
            price: parseFloat(p.price),
            image: p.image,
            category: p.category,
            rating: parseFloat(p.rating) || 0,
            reviewCount: p.review_count || 0,
            calories: p.calories,
            prepTime: p.prep_time || '5 min',
            tags: Array.isArray(p.tags) ? p.tags : [],
            ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
            isPopular: p.is_popular || false,
            isNew: p.is_new || false,
          })));
        }
      }
    } catch {
      // Fallback to local data
      setApiItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ── Fetch reviews from API (fallback to local data) ─────────
  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const data = await reviewsApi.list(id);
      if (Array.isArray(data) && data.length > 0) {
        setApiReviews(data);
      }
    } catch {
      // Fallback to local reviews
      setApiReviews(null);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [fetchProduct, fetchReviews]);

  // Use API data if available, otherwise local data
  const item = apiItem || localItems.find((m) => m.id === id);

  // Reset state when product changes
  useEffect(() => {
    setQuantity(1);
    setCustomSelections({});
    setJustAdded(false);
    setActiveTab('description');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  const detailData = useMemo(() => {
    if (!item) return null;
    return getProductDetail(
      item.id,
      item.image,
      item.name,
      item.category,
      item.rating,
      item.reviewCount,
      item.calories || 0,
    );
  }, [item]);

  if (!item || !detailData) {
    return (
      <Section padding="lg" className="pt-32">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-text">Item not found</h1>
          <p className="mt-4 text-text-muted">
            The item you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-8">
            <Button to="/menu" variant="primary" size="md">Back to Menu</Button>
          </div>
        </div>
      </Section>
    );
  }

  const favorited = isFavorite(item.id);
  const related = apiRelated.length > 0
    ? apiRelated
    : localItems.filter((m) => m.category === item.category && m.id !== item.id).slice(0, 3);

  // Calculate price modifier from customizations
  const priceModifier = useMemo(() => {
    let modifier = 0;
    detailData.customizations.forEach((group) => {
      const selected = customSelections[group.id] || [];
      group.options.forEach((opt) => {
        if (selected.includes(opt.id) && opt.priceModifier) {
          modifier += opt.priceModifier;
        }
      });
    });
    return modifier;
  }, [customSelections, detailData.customizations]);

  const unitPrice = item.price + priceModifier;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: item.id,
        name: item.name,
        price: unitPrice,
        image: item.image,
      });
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const tabs = [
    { id: 'description' as const, label: 'Description' },
    { id: 'ingredients' as const, label: 'Ingredients' },
    { id: 'nutrition' as const, label: 'Nutrition' },
    { id: 'reviews' as const, label: `Reviews (${item.reviewCount})` },
  ];

  return (
    <div className="pt-20">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <Section padding="none" className="pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-text-muted">
          <button onClick={() => navigate('/menu')} className="hover:text-accent transition-colors">
            Menu
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="capitalize">{item.category.replace('-', ' ')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text font-medium truncate">{item.name}</span>
        </nav>
      </Section>

      {/* ── Main Product Section ──────────────────────────────── */}
      <Section padding="none" className="pb-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ImageGallery
              images={detailData.gallery}
              badges={
                <>
                  {item.isPopular && <Badge variant="accent" size="md">Popular</Badge>}
                  {item.isNew && (
                    <Badge size="md" className="bg-sage-100 text-sage-700 border-sage-200 dark:bg-sage-800/40 dark:text-sage-300 dark:border-sage-700/50">
                      New
                    </Badge>
                  )}
                </>
              }
            />
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category */}
            <span className="text-sm font-medium uppercase tracking-wider text-accent capitalize">
              {item.category.replace('-', ' ')}
            </span>

            {/* Name */}
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-text sm:text-4xl">
              {item.name}
            </h1>

            {/* Rating + reviews link */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <StarRating rating={item.rating} size="md" showNumber reviewCount={item.reviewCount} />
              <button
                onClick={() => {
                  setActiveTab('reviews');
                  document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-sm font-medium text-accent hover:underline"
              >
                Read reviews
              </button>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-4xl font-bold text-accent">
                ${unitPrice.toFixed(2)}
              </span>
              {priceModifier > 0 && (
                <span className="text-sm text-text-muted line-through">
                  ${item.price.toFixed(2)}
                </span>
              )}
              <span className="text-sm text-text-muted">per serving</span>
            </div>

            {/* Short description */}
            <p className="mt-5 text-base leading-relaxed text-text-muted">
              {item.description}
            </p>

            {/* Quick meta */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted">
                <Clock className="h-4 w-4 text-accent" />
                {item.prepTime}
              </div>
              {item.calories !== undefined && (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted">
                  <Flame className="h-4 w-4 text-accent" />
                  {item.calories} cal
                </div>
              )}
              {item.tags.includes('signature') && (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted">
                  <Award className="h-4 w-4 text-accent" />
                  Signature
                </div>
              )}
              {item.tags.includes('vegan') && (
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted">
                  <Leaf className="h-4 w-4 text-accent" />
                  Vegan
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="muted" size="sm">
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>

            {/* ── Customization ─────────────────────────────────── */}
            <div className="mt-8 border-t border-border pt-8">
              <h2 className="mb-4 font-serif text-xl font-bold text-text">
                Customize Your Order
              </h2>
              <CustomizationPanel
                groups={detailData.customizations}
                selections={customSelections}
                onSelectionChange={(groupId, optionIds) =>
                  setCustomSelections((prev) => ({ ...prev, [groupId]: optionIds }))
                }
              />
            </div>

            {/* ── Quantity + Add to Cart + Wishlist ──────────────── */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Quantity */}
              <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-serif text-lg font-bold text-text">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to cart */}
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart · ${totalPrice.toFixed(2)}
              </Button>

              {/* Wishlist */}
              <button
                onClick={() => toggleFavorite(item.id)}
                aria-label={favorited ? 'Remove from wishlist' : 'Add to wishlist'}
                className={cn(
                  'flex h-13 w-13 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                  favorited
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-border bg-surface text-text-muted hover:text-red-500 hover:border-red-300',
                )}
              >
                <Heart className={cn('h-5 w-5 transition-all', favorited && 'fill-current')} />
              </button>
            </div>

            {/* Added confirmation */}
            {justAdded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl border border-sage-300 bg-sage-50 px-4 py-3 text-sm text-sage-700 dark:border-sage-700 dark:bg-sage-900/20 dark:text-sage-300"
              >
                <Check className="h-4 w-4" />
                {quantity} × {item.name} added to your cart
              </motion.div>
            )}
          </motion.div>
        </div>
      </Section>

      {/* ── Tabbed Content ──────────────────────────────────────── */}
      <Section variant="muted" padding="lg">
        {/* Tab bar */}
        <div id="product-tabs" className="-mx-4 mb-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative shrink-0 px-5 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text',
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Description */}
          {activeTab === 'description' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="font-serif text-2xl font-bold text-text">About this item</h3>
                <p className="mt-4 text-base leading-relaxed text-text-muted">
                  {item.longDescription}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="muted" size="md">
                      {tag.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Quick facts */}
              <div className="rounded-2xl border border-border bg-surface p-6">
                <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-text">
                  Quick Facts
                </h4>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Prep Time</dt>
                    <dd className="font-medium text-text">{item.prepTime}</dd>
                  </div>
                  {item.calories !== undefined && (
                    <div className="flex justify-between">
                      <dt className="text-text-muted">Calories</dt>
                      <dd className="font-medium text-text">{item.calories}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Category</dt>
                    <dd className="font-medium text-text capitalize">{item.category.replace('-', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Rating</dt>
                    <dd className="font-medium text-text">{item.rating.toFixed(1)} / 5</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Reviews</dt>
                    <dd className="font-medium text-text">{item.reviewCount}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Ingredients */}
          {activeTab === 'ingredients' && (
            <div className="max-w-3xl">
              <h3 className="font-serif text-2xl font-bold text-text">Ingredients</h3>
              <p className="mt-2 text-sm text-text-muted">
                We source the finest ingredients from local partners and ethical farms.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {item.ingredients.map((ing, i) => (
                  <motion.div
                    key={ing}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800/40 dark:text-sage-300">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-text">{ing}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-caramel-200 bg-caramel-50 p-4 dark:border-caramel-800/50 dark:bg-caramel-900/10">
                <p className="text-sm text-text-muted">
                  <span className="font-medium text-text">Allergen notice:</span> Contains
                  milk. May contain traces of nuts, soy, and gluten. Please inform our
                  staff of any allergies before ordering.
                </p>
              </div>
            </div>
          )}

          {/* Nutrition */}
          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="mx-auto w-full max-w-md">
                <NutritionPanel
                  calories={item.calories || 0}
                  servingSize={detailData.nutrition.servingSize}
                  nutrients={detailData.nutrition.nutrients}
                />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-text">Dietary Information</h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Vegetarian', included: item.tags.includes('vegetarian') || item.tags.includes('vegan') },
                    { label: 'Vegan', included: item.tags.includes('vegan') },
                    { label: 'Gluten-Free', included: item.tags.includes('gluten-free') },
                    { label: 'Sugar-Free', included: item.tags.includes('sugar-free') },
                    { label: 'Contains Dairy', included: !item.tags.includes('vegan') && ['latte', 'mocha', 'espresso'].includes(item.category) },
                    { label: 'Contains Caffeine', included: ['coffee', 'espresso', 'latte', 'mocha', 'cold-coffee', 'tea'].includes(item.category) },
                  ].map((diet) => (
                    <div
                      key={diet.label}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                    >
                      <span className="text-sm font-medium text-text">{diet.label}</span>
                      {diet.included ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-sage-600 dark:text-sage-400">
                          <Check className="h-4 w-4" /> Yes
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">No</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <ReviewsSection
              reviews={apiReviews && apiReviews.length > 0
                ? apiReviews.map((r: any) => ({
                    id: r.id || r.product_id + '-' + r.author,
                    author: r.author || 'Anonymous',
                    rating: r.rating,
                    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', 'day': 'numeric', year: 'numeric' }) : 'Recently',
                    title: r.title || '',
                    body: r.body || '',
                    helpfulCount: r.helpful_count || 0,
                    verified: r.is_approved || false,
                  }))
                : detailData.reviews
              }
              averageRating={item.rating}
              totalReviews={item.reviewCount}
              ratingBreakdown={detailData.ratingBreakdown}
            />
          )}
        </motion.div>
      </Section>

      {/* ── Related Products ────────────────────────────────────── */}
      {related.length > 0 && (
        <Section padding="lg">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <Badge variant="accent" size="md" className="mb-3">You might also like</Badge>
              <h2 className="font-serif text-2xl font-bold text-text sm:text-3xl">
                More from {item.category.replace('-', ' ')}
              </h2>
            </div>
            <Button to="/menu" variant="ghost" size="sm" className="hidden sm:inline-flex">
              View all
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rel, i) => (
              <ProductCard key={rel.id} item={rel} index={i} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Sticky Add to Cart Bar (mobile) ─────────────────────── */}
      <AddToCartBar
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        unitPrice={unitPrice}
        justAdded={justAdded}
        className="lg:hidden"
      />
    </div>
  );
}
