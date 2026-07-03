import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../lib/api';

interface FavoritesContextValue {
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  favoriteCount: number;
  syncing: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const isInitialSync = useRef(true);
  const skipNextSync = useRef(false);

  // ── Sync: Load wishlist from backend when user logs in ──────
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadRemoteWishlist = async () => {
      setSyncing(true);
      try {
        const remoteItems = await wishlistApi.list();

        if (cancelled) return;

        if (Array.isArray(remoteItems)) {
          const remoteIds = new Set(
            remoteItems.map((ri: any) => ri.product_id || ri.products?.id),
          );
          // Merge: union of local and remote favorites
          setFavorites((prev) => {
            const merged = new Set(prev);
            remoteIds.forEach((id) => merged.add(id));
            return merged;
          });
        }
      } catch {
        // Silently fail — local favorites still work
      } finally {
        if (!cancelled) {
          setSyncing(false);
          isInitialSync.current = false;
        }
      }
    };

    loadRemoteWishlist();

    return () => { cancelled = true; };
  }, [user]);

  // ── Sync: Push wishlist changes to backend ──────────────────
  useEffect(() => {
    if (!user || isInitialSync.current || skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    let cancelled = false;

    const syncRemote = async () => {
      try {
        const remoteItems: any[] = await wishlistApi.list();
        if (cancelled) return;
        
        const remoteIds = new Set(
          (remoteItems || []).map((ri) => ri.product_id),
        );

        // Add items that are local but not remote
        for (const id of favorites) {
          if (!remoteIds.has(id)) {
            await wishlistApi.add(id);
          }
        }

        // Remove items that are remote but not local
        for (const ri of remoteItems || []) {
          if (!favorites.has(ri.product_id)) {
            await wishlistApi.remove(ri.product_id);
          }
        }
      } catch {
        // Silently fail
      }
    };

    syncRemote();

    return () => { cancelled = true; };
  }, [favorites, user]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.size,
        syncing,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
