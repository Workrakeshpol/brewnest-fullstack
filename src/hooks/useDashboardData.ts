import { useState, useEffect, useCallback, useMemo } from 'react';
import { ordersApi, reservationsApi, notificationsApi, addressesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import {
  userProfile as staticProfile,
  orders as staticOrders,
  reservations as staticReservations,
  savedAddresses as staticAddresses,
  notifications as staticNotifications,
  type Order,
  type Reservation,
  type SavedAddress,
  type AppNotification,
  type UserProfile,
} from '../data/dashboardData';

export interface DashboardData {
  profile: UserProfile;
  orders: Order[];
  reservations: Reservation[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  loading: boolean;
  refresh: () => void;
}

/* ── Transform API data to match frontend types ─────────────── */

function transformOrders(apiOrders: any[]): Order[] {
  return (apiOrders || []).map((o) => ({
    id: o.order_number || o.id,
    date: o.created_at
      ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Unknown',
    status: o.status || 'completed',
    total: parseFloat(o.total || 0),
    type: o.delivery_type || 'pickup',
    location: o.pickup_location || o.delivery_address?.split(',')[0] || 'Maple Street',
    items: (o.order_items || []).map((it: any) => ({
      name: it.product_name || it.name,
      quantity: it.quantity,
      price: parseFloat(it.price),
      image: it.image || `/images/${it.product_id || 'beans'}.jpg`,
    })),
  }));
}

function transformReservations(apiRes: any[]): Reservation[] {
  return (apiRes || []).map((r) => {
    const status = r.status === 'confirmed' ? 'upcoming' : r.status;
    return {
      id: r.id?.toString() || `RSV-${Date.now()}`,
      date: r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
      time: r.time || 'Unknown',
      partySize: r.party_size || 1,
      location: r.location === 'maple' ? 'Maple Street' :
                r.location === 'riverside' ? 'Riverside District' :
                r.location === 'eastside' ? 'Eastside Roastery' :
                r.location || 'Maple Street',
      status: status as Reservation['status'],
      notes: r.notes || undefined,
    };
  });
}

function transformAddresses(apiAddrs: any[]): SavedAddress[] {
  return (apiAddrs || []).map((a) => ({
    id: a.id?.toString() || `addr-${Date.now()}`,
    label: a.label || 'Address',
    address: a.address || '',
    city: a.city || '',
    zip: a.zip || '',
    isDefault: a.is_default || false,
  }));
}

function transformNotifications(apiNotifs: any[]): AppNotification[] {
  return (apiNotifs || []).map((n) => ({
    id: n.id?.toString() || `n-${Date.now()}`,
    type: n.type as AppNotification['type'],
    title: n.title || '',
    message: n.message || '',
    time: n.created_at
      ? getRelativeTime(n.created_at)
      : 'Recently',
    read: n.is_read || false,
  }));
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Hook ───────────────────────────────────────────────────── */

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>(staticOrders);
  const [reservations, setReservations] = useState<Reservation[]>(staticReservations);
  const [addresses, setAddresses] = useState<SavedAddress[]>(staticAddresses);
  const [notifications, setNotifications] = useState<AppNotification[]>(staticNotifications);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const results = await Promise.allSettled([
      ordersApi.list(),
      user?.email ? reservationsApi.list(user.email) : Promise.resolve([]),
      notificationsApi.list(),
      addressesApi.list(),
    ]);

    // Orders
    if (results[0].status === 'fulfilled' && Array.isArray(results[0].value) && results[0].value.length > 0) {
      setOrders(transformOrders(results[0].value));
    }

    // Reservations
    if (results[1].status === 'fulfilled' && Array.isArray(results[1].value) && results[1].value.length > 0) {
      setReservations(transformReservations(results[1].value));
    }

    // Notifications
    if (results[2].status === 'fulfilled' && Array.isArray(results[2].value) && results[2].value.length > 0) {
      setNotifications(transformNotifications(results[2].value));
    }

    // Addresses
    if (results[3].status === 'fulfilled' && Array.isArray(results[3].value) && results[3].value.length > 0) {
      setAddresses(transformAddresses(results[3].value));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Compute profile from user + orders
  const profile = useMemo<UserProfile>(() => ({
    name: user?.name || staticProfile.name,
    email: user?.email || staticProfile.email,
    phone: user?.phone || staticProfile.phone,
    avatar: user?.name?.charAt(0).toUpperCase() || staticProfile.avatar,
    memberSince: staticProfile.memberSince,
    loyaltyPoints: staticProfile.loyaltyPoints,
    tier: staticProfile.tier,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
  }), [user, orders]);

  return {
    profile,
    orders,
    reservations,
    addresses,
    notifications,
    loading,
    refresh: fetchAll,
  };
}
