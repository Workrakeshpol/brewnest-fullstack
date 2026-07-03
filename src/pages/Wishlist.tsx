import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import Section from '../components/ui/Section';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/cart/EmptyState';
import WishlistItemCard from '../components/cart/WishlistItemCard';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { menuItems as localItems } from '../data/menuData';
import { productsApi } from '../lib/api';
import supabase from '../lib/supabase';
import type { MenuItem } from '../types/menu';

export default function Wishlist() {
  const { favorites, favoriteCount } = useFavorites();
  const { user } = useAuth();
  const [apiProducts, setApiProducts] = useState<Record<string, MenuItem>>({});

  // ── Fetch product details from API for wishlisted items ─────
  const fetchWishlistProducts = useCallback(async () => {
    if (favorites.size === 0) {
      setApiProducts({});
      return;
    }

    const ids = Array.from(favorites);
    const fetched: Record<string, MenuItem> = {};

    // Try fetching each product from the API
    await Promise.all(
      ids.map(async (id) => {
        try {
          const data = await productsApi.get(id);
          if (data) {
            fetched[id] = {
              id: data.id,
              name: data.name,
              description: data.description || '',
              longDescription: data.long_description || '',
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
          }
        } catch {
          // Will fall back to local data
        }
      }),
    );

    setApiProducts(fetched);
  }, [favorites]);

  useEffect(() => {
    fetchWishlistProducts();
  }, [fetchWishlistProducts]);

  // Build the list: use API data if available, otherwise local data
  const wishlistedItems: MenuItem[] = Array.from(favorites)
    .map((id) => apiProducts[id] || localItems.find((m) => m.id === id))
    .filter((item): item is MenuItem => item !== undefined);

  if (wishlistedItems.length === 0) {
    return (
      <Section padding="lg" className="pt-32">
        <EmptyState
          icon={<Heart className="h-12 w-12 text-text-muted" />}
          title="Your wishlist is empty"
          message="Tap the heart icon on any item to save it here for later. Your favorites will always be one click away."
          ctaLabel="Discover the Menu"
          ctaTo="/menu"
        />
      </Section>
    );
  }

  return (
    <>
      {/* ── Header ───────────────────────────────────────────── */}
      <Section padding="none" className="pt-28 pb-6">
        <div className="text-center">
          <Badge variant="accent" size="md" className="mb-3">
            {favoriteCount} {favoriteCount === 1 ? 'saved item' : 'saved items'}
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-text sm:text-4xl">
            Your Wishlist
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Items you've saved for later. Add them to your cart whenever you're ready.
          </p>
        </div>
      </Section>

      {/* ── Wishlist grid ────────────────────────────────────── */}
      <Section padding="none" className="pb-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {wishlistedItems.map((item, i) => (
            <WishlistItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </Section>
    </>
  );
}
