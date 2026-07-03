import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';
import { cartApi, couponsApi } from '../lib/api';
import { CartItem, Coupon, DeliveryType } from '../types';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryType: DeliveryType;
  setDeliveryType: (type: DeliveryType) => void;
  deliveryFee: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  coupon: Coupon | null;
  appliedCouponCode: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  syncing: boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const TAX_RATE = 0.08; // 8% tax rate as requested
const DELIVERY_FEE = 4.00; // Flat rate of $4.00
const FREE_DELIVERY_THRESHOLD = 35.00; // FREE on orders over $35.00

// Local fallback coupons (used when API is unavailable)
const LOCAL_COUPONS: Record<string, Partial<Coupon>> = {
  WELCOME10: { code: 'WELCOME10', type: 'percentage', value: 10, label: '10% off your order' },
  BREWNEST15: { code: 'BREWNEST15', type: 'percentage', value: 15, label: '15% off your order' },
  SAVE5: { code: 'SAVE5', type: 'fixed', value: 5, label: '$5 off your order' },
  FREESHIP: { code: 'FREESHIP', type: 'fixed', value: 3.50, label: 'Free delivery' },
};

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const local = localStorage.getItem('brewnest_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const isInitialSync = useRef(true);
  const skipNextSync = useRef(false);

  // Persist to localStorage whenever cart items change
  useEffect(() => {
    localStorage.setItem('brewnest_cart', JSON.stringify(items));
  }, [items]);

  // ── Sync: Load cart from backend when user logs in ──────────
  useEffect(() => {
    if (!user) {
      // User logged out — keep local cart but don't sync
      return;
    }

    let cancelled = false;

    const loadRemoteCart = async () => {
      setSyncing(true);
      try {
        const remoteItems = await cartApi.list();

        if (cancelled) return;

        if (Array.isArray(remoteItems) && remoteItems.length > 0) {
          // Map remote cart items to local format
          const mapped: CartItem[] = remoteItems.map((ri: any) => ({
            id: ri.product_id || ri.products?.id,
            name: ri.products?.name || ri.name || 'Unknown',
            price: parseFloat(ri.products?.price || ri.price || 0),
            image: ri.products?.image || ri.image || '/images/beans.jpg',
            quantity: ri.quantity,
          }));
          setItems(mapped);
        }
      } catch {
        // Silently fail — local cart still works
      } finally {
        if (!cancelled) {
          setSyncing(false);
          isInitialSync.current = false;
        }
      }
    };

    loadRemoteCart();

    return () => { cancelled = true; };
  }, [user]);

  // ── Sync: Push cart changes to backend when authenticated ───
  useEffect(() => {
    if (!user || isInitialSync.current || skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    let cancelled = false;

    const syncRemote = async () => {
      try {
        const remoteItems: any[] = await cartApi.list();
        if (cancelled) return;

        const remoteMap = new Map(
          (remoteItems || []).map((ri) => [ri.product_id, ri.quantity]),
        );

        // Add/update items that differ
        for (const item of items) {
          const remoteQty = remoteMap.get(item.id) || 0;
          if (item.quantity !== remoteQty) {
            await cartApi.update(item.id, item.quantity);
          }
        }

        // Remove items that are in remote but not local
        for (const ri of remoteItems || []) {
          if (!items.find((i) => i.id === ri.product_id)) {
            await cartApi.remove(ri.product_id);
          }
        }
      } catch {
        // Silently fail — local cart is source of truth for UI
      }
    };

    syncRemote();

    return () => { cancelled = true; };
  }, [items, user]);

  // ── Cart operations ─────────────────────────────────────────
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    // Also clear remote cart if authenticated
    if (user) {
      items.forEach((item) => {
        cartApi.remove(item.id).catch(() => {});
      });
    }
  }, [user, items]);

  const isInCart = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items],
  );

  // ── Coupon validation via API (with local fallback) ─────────
  const applyCoupon = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      const data = await couponsApi.validate(normalized);
      const couponData: Coupon = {
        id: data.id || '',
        code: data.code || normalized,
        type: (data.type || 'percentage') as 'percentage' | 'fixed',
        value: parseFloat(data.value || '0'),
        label: data.label || '',
        max_uses: data.max_uses || null,
        used_count: data.used_count || 0,
        min_order: parseFloat(data.min_order || '0'),
        expires_at: data.expires_at || null,
        is_active: data.is_active ?? true,
        created_at: data.created_at || '',
      };
      setCoupon(couponData);
      return { success: true, message: `Coupon applied: ${couponData.label}!` };
    } catch (err: any) {
      // Check if it's a known local coupon as fallback
      const localCoupon = LOCAL_COUPONS[normalized];
      if (localCoupon) {
        const fullCoupon: Coupon = {
          id: '',
          code: localCoupon.code || normalized,
          type: (localCoupon.type || 'percentage') as 'percentage' | 'fixed',
          value: localCoupon.value || 0,
          label: localCoupon.label || '',
          max_uses: null,
          used_count: 0,
          min_order: 0,
          expires_at: null,
          is_active: true,
          created_at: '',
        };
        setCoupon(fullCoupon);
        return { success: true, message: `Coupon applied: ${fullCoupon.label}!` };
      }
      return { success: false, message: err.message || 'Invalid coupon code. Please try again.' };
    }
  }, []);

  const removeCoupon = useCallback(() => setCoupon(null), []);

  // ── Derived values ──────────────────────────────────────────
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  const deliveryFee = useMemo(() => {
    if (deliveryType === 'pickup') return 0;
    if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
    return DELIVERY_FEE;
  }, [deliveryType, subtotal]);

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.code === 'FREESHIP') {
      return deliveryType === 'delivery' ? DELIVERY_FEE : 0;
    }
    if (coupon.type === 'percentage') {
      return Math.round(subtotal * coupon.value) / 100;
    }
    return Math.min(coupon.value, subtotal);
  }, [coupon, subtotal, deliveryType]);

  const taxableAmount = useMemo(() => Math.max(0, subtotal - (coupon?.type === 'fixed' && coupon.code !== 'FREESHIP' ? discount : 0)), [subtotal, coupon, discount]);
  const taxAmount = useMemo(() => Math.round(taxableAmount * TAX_RATE * 100) / 100, [taxableAmount]);
  const total = useMemo(() => Math.max(0, subtotal - discount + taxAmount + deliveryFee), [subtotal, discount, taxAmount, deliveryFee]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        taxRate: TAX_RATE,
        taxAmount,
        discount,
        coupon,
        appliedCouponCode: coupon?.code ?? null,
        applyCoupon,
        removeCoupon,
        total: Math.round(total * 100) / 100,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        syncing,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
