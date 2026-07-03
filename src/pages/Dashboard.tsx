import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  ShoppingBag,
  CalendarDays,
  Heart,
  MapPin,
  Bell,
  Settings,
  KeyRound,
  Star,
  Clock,
  TrendingUp,
  Award,
  Plus,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin as LocationIcon,
  PartyPopper,
  Coffee,
  Tag,
  Info,
  Moon,
  Globe,
  Shield,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import DashboardLayout, { type DashboardTab } from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/dashboard/StatusBadge';
import Modal from '../components/dashboard/Modal';
import { Toggle, CopyButton } from '../components/dashboard/Toggle';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StarRating from '../components/menu/StarRating';
import { Card } from '../components/ui/Card';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { menuItems } from '../data/menuData';
import { useDashboardData } from '../hooks/useDashboardData';
import { notificationsApi, addressesApi, reservationsApi } from '../lib/api';
import type {
  Order,
  SavedAddress,
  AppNotification,
} from '../data/dashboardData';
import { cn } from '../lib/utils';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const { profile, orders, reservations, addresses: initialAddresses, notifications: initialNotifications, loading, refresh } = useDashboardData();
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '', city: '', zip: '' });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Sync state when API data loads
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const { favorites } = useFavorites();
  const { addToCart } = useCart();
  const wishlistedItems = menuItems.filter((item) => favorites.has(item.id));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    notificationsApi.markRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch(() => {});
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notificationsApi.delete(id).catch(() => {});
  };

  const handleAddAddress = async () => {
    const e: Record<string, string> = {};
    if (!newAddress.label.trim()) e.label = 'Label is required';
    if (!newAddress.address.trim()) e.address = 'Address is required';
    if (!newAddress.city.trim()) e.city = 'City is required';
    if (!newAddress.zip.trim()) e.zip = 'ZIP code is required';
    setAddressErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      await addressesApi.create(newAddress);
      refresh();
    } catch {
      // fallback to local state
      setAddresses((prev) => [
        ...prev,
        { id: `addr-${Date.now()}`, ...newAddress },
      ]);
    }
    setNewAddress({ label: '', address: '', city: '', zip: '' });
    setAddressModalOpen(false);
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    addressesApi.delete(id).catch(() => {});
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id })),
    );
    addressesApi.update(id, { is_default: true }).catch(() => {});
  };

  if (role === 'admin' || role === 'manager' || demoManagerMode) {
    return (
      <ManagerDashboard
        onExitDemo={() => setDemoManagerMode(false)}
        isDemo={role !== 'admin' && role !== 'manager'}
      />
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      notificationCount={unreadCount}
    >
      {/* Developer / Instructor Demo Switch Banner */}
      <div className="mb-6 rounded-2xl border border-caramel-200 bg-caramel-50/50 p-4 text-sm text-caramel-800 dark:border-caramel-900/30 dark:bg-caramel-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="font-bold">🖥️ Developer / Instructor Notice:</span> You are viewing the customer dashboard. Switch to the Manager Console to inspect sales charts and order tables.
        </div>
        <button
          onClick={() => setDemoManagerMode(true)}
          className="shrink-0 rounded-full bg-caramel-500 px-4 py-1.5 text-xs font-semibold text-espresso-950 hover:bg-caramel-400 transition-colors cursor-pointer"
        >
          Open Manager Console
        </button>
      </div>
      {/* ═══════════════════════════════════════════════════════
          PROFILE TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          )}
          {!loading && (
            <>
          {/* Header card */}
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-espresso-800 to-espresso-600 dark:from-caramel-600 dark:to-caramel-400" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-surface bg-gradient-to-br from-caramel-400 to-caramel-600 font-serif text-3xl font-bold text-white shadow-card">
                    {profile.avatar}
                  </div>
                  <div className="pb-1">
                    <h1 className="font-serif text-2xl font-bold text-text">{profile.name}</h1>
                    <p className="text-sm text-text-muted">{profile.email}</p>
                  </div>
                </div>
                <Badge variant="accent" size="md" className="mb-1">
                  <Award className="mr-1 h-3.5 w-3.5" />
                  {profile.tier} Member
                </Badge>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard index={0} icon={<ShoppingBag className="h-5 w-5" />} label="Total Orders" value={profile.totalOrders} accent="caramel" />
            <StatCard index={1} icon={<TrendingUp className="h-5 w-5" />} label="Total Spent" value={`$${profile.totalSpent.toFixed(0)}`} accent="sage" />
            <StatCard index={2} icon={<Star className="h-5 w-5" />} label="Loyalty Points" value={profile.loyaltyPoints} accent="caramel" />
            <StatCard index={3} icon={<Clock className="h-5 w-5" />} label="Member Since" value={profile.memberSince} accent="espresso" />
          </div>

          {/* Profile info form */}
          <Card className="p-6">
            <h2 className="mb-5 font-serif text-lg font-bold text-text">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Full Name" name="name" defaultValue={profile.name} />
              <Input label="Email" name="email" type="email" defaultValue={profile.email} leftIcon={<Mail className="h-4 w-4" />} />
              <Input label="Phone" name="phone" type="tel" defaultValue={profile.phone || ''} leftIcon={<Phone className="h-4 w-4" />} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">Member Tier</label>
                <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-surface-hover px-4 text-sm text-text">
                  <Award className="h-4 w-4 text-accent" />
                  {profile.tier} — {profile.loyaltyPoints} pts
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md">Save Changes</Button>
            </div>
          </Card>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ORDERS TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-text">Order History</h1>
              <p className="mt-1 text-sm text-text-muted">{orders.length} total orders</p>
            </div>
            <Button to="/menu" variant="outline" size="sm">Order Again</Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-text-muted" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-text">No orders yet</h3>
              <p className="mt-2 text-sm text-text-muted">Your order history will appear here once you place your first order.</p>
              <div className="mt-6"><Button to="/menu" variant="primary" size="md">Browse Menu</Button></div>
            </Card>
          ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  {/* Order header */}
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-surface-hover/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-semibold text-text">{order.id}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-text-muted">
                          {order.date} · {order.type === 'pickup' ? 'Pickup' : 'Delivery'} · {order.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-serif text-lg font-bold text-accent">${order.total.toFixed(2)}</span>
                      <ChevronRight className={cn('h-5 w-5 text-text-muted transition-transform', expandedOrders.has(order.id) && 'rotate-90')} />
                    </div>
                  </button>

                  {/* Expanded items */}
                  {expandedOrders.has(order.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border"
                    >
                      <div className="p-5 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-text">{item.name}</p>
                              <p className="text-xs text-text-muted">${item.price.toFixed(2)} each</p>
                            </div>
                            <span className="text-sm text-text-muted">×{item.quantity}</span>
                            <span className="w-16 text-right text-sm font-medium text-text">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end gap-3 border-t border-border p-4">
                        <Button variant="ghost" size="sm">View Receipt</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => order.items.forEach(it => addToCart({ id: it.name, name: it.name, price: it.price, image: it.image }))}
                        >
                          Reorder
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          RESERVATIONS TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'reservations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-text">Reservations</h1>
              <p className="mt-1 text-sm text-text-muted">Manage your table bookings</p>
            </div>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" />
              New Reservation
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : reservations.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-12 w-12 text-text-muted" />
                <h3 className="mt-4 font-serif text-lg font-semibold text-text">No reservations yet</h3>
                <p className="mt-2 text-sm text-text-muted">Book a table and your reservations will appear here.</p>
              </Card>
            ) : (
            reservations.map((res, i) => (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base font-semibold text-text">{res.date} · {res.time}</span>
                          <StatusBadge status={res.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-text-muted">
                          <PartyPopper className="mr-1 inline h-3.5 w-3.5" />
                          Party of {res.partySize} · {res.location}
                        </p>
                        {res.notes && (
                          <p className="mt-1 text-xs italic text-text-muted">"{res.notes}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {res.status === 'upcoming' && (
                        <>
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" className="text-red-500 hover:border-red-300" onClick={() => {
                            reservationsApi.cancel(res.id).catch(() => {});
                            refresh();
                          }}>Cancel</Button>
                        </>
                      )}
                      {res.status === 'completed' && (
                        <Button variant="ghost" size="sm">Book Again</Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          WISHLIST TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-text">Wishlist</h1>
              <p className="mt-1 text-sm text-text-muted">{wishlistedItems.length} saved items</p>
            </div>
            <Button to="/wishlist" variant="outline" size="sm">View All</Button>
          </div>

          {wishlistedItems.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="h-12 w-12 text-text-muted" />
              <h3 className="mt-4 font-serif text-lg font-semibold text-text">No favorites yet</h3>
              <p className="mt-2 text-sm text-text-muted">Browse the menu and tap the heart icon to save items.</p>
              <div className="mt-6">
                <Button to="/menu" variant="primary" size="md">Browse Menu</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {wishlistedItems.slice(0, 6).map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card interactive className="flex gap-4 p-4">
                    <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                    <div className="flex flex-1 flex-col">
                      <Link to={`/menu/${item.id}`} className="font-serif text-base font-semibold text-text hover:text-accent transition-colors">
                        {item.name}
                      </Link>
                      <StarRating rating={item.rating} size="sm" showNumber reviewCount={item.reviewCount} className="mt-1" />
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-serif text-lg font-bold text-accent">${item.price.toFixed(2)}</span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ADDRESSES TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-text">Saved Addresses</h1>
              <p className="mt-1 text-sm text-text-muted">{addresses.length} addresses saved</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAddressModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((addr, i) => (
              <motion.div key={addr.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn('p-5', addr.isDefault && 'ring-1 ring-accent/30')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-serif text-base font-semibold text-text">{addr.label}</p>
                        {addr.isDefault && <Badge variant="accent" size="sm" className="mt-0.5">Default</Badge>}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-text-muted">
                    <p className="text-text">{addr.address}</p>
                    <p>{addr.city}, {addr.zip}</p>
                  </div>
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="mt-4 text-xs font-medium text-accent hover:underline"
                    >
                      Set as default
                    </button>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Add address modal */}
          <Modal open={addressModalOpen} onClose={() => setAddressModalOpen(false)} title="Add New Address">
            <div className="space-y-4">
              <Input label="Label (e.g. Home, Work)" name="label" placeholder="Home" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} error={addressErrors.label} />
              <Input label="Street Address" name="address" placeholder="128 Maple Street" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} error={addressErrors.address} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" name="city" placeholder="Portland" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} error={addressErrors.city} />
                <Input label="ZIP Code" name="zip" placeholder="97201" value={newAddress.zip} onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })} error={addressErrors.zip} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="md" onClick={() => setAddressModalOpen(false)}>Cancel</Button>
                <Button variant="primary" size="md" onClick={handleAddAddress}>Save Address</Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          NOTIFICATIONS TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-text">Notifications</h1>
              <p className="mt-1 text-sm text-text-muted">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <Check className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-12 w-12 text-text-muted" />
                <h3 className="mt-4 font-serif text-lg font-semibold text-text">No notifications</h3>
                <p className="mt-2 text-sm text-text-muted">You're all caught up!</p>
              </Card>
            ) : (
              notifications.map((notif, i) => {
                const iconMap = {
                  order: ShoppingBag,
                  reservation: CalendarDays,
                  promo: Tag,
                  system: Info,
                };
                const Icon = iconMap[notif.type];
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className={cn('p-4', !notif.read && 'border-l-4 border-l-accent')}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                          notif.type === 'order' && 'bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300',
                          notif.type === 'reservation' && 'bg-sage-100 text-sage-700 dark:bg-sage-800/40 dark:text-sage-300',
                          notif.type === 'promo' && 'bg-espresso-100 text-espresso-700 dark:bg-espresso-800/40 dark:text-espresso-200',
                          notif.type === 'system' && 'bg-surface-hover text-text-muted',
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-text">{notif.title}</p>
                              <p className="mt-0.5 text-sm text-text-muted">{notif.message}</p>
                            </div>
                            <span className="shrink-0 text-xs text-text-muted">{notif.time}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            {!notif.read && (
                              <button onClick={() => markNotificationRead(notif.id)} className="text-xs font-medium text-accent hover:underline">
                                Mark as read
                              </button>
                            )}
                            <button onClick={() => deleteNotification(notif.id)} className="text-xs font-medium text-text-muted hover:text-red-500 transition-colors">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SETTINGS TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-text">Settings</h1>
            <p className="mt-1 text-sm text-text-muted">Manage your preferences</p>
          </div>

          <SettingsSection icon={Bell} title="Notifications">
            <Toggle checked={true} onChange={() => {}} label="Order updates" description="Get notified about order status changes" />
            <Toggle checked={true} onChange={() => {}} label="Reservation reminders" description="Reminders before your reservations" />
            <Toggle checked={false} onChange={() => {}} label="Promotional offers" description="Receive deals and seasonal promotions" />
            <Toggle checked={true} onChange={() => {}} label="Loyalty rewards" description="Updates about points and tier changes" />
          </SettingsSection>

          <SettingsSection icon={Moon} title="Appearance">
            <Toggle checked={true} onChange={() => {}} label="Dark mode" description="Use dark theme across the app" />
            <Toggle checked={false} onChange={() => {}} label="Reduce motion" description="Minimize animations and transitions" />
          </SettingsSection>

          <SettingsSection icon={Globe} title="Localization">
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-text">Language</p>
                <p className="text-xs text-text-muted">Display language</p>
              </div>
              <select className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-accent">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-text">Currency</p>
                <p className="text-xs text-text-muted">Display currency</p>
              </div>
              <select className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text outline-none focus:border-accent">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </SettingsSection>

          <SettingsSection icon={Shield} title="Privacy">
            <Toggle checked={true} onChange={() => {}} label="Profile visibility" description="Allow other members to see your profile" />
            <Toggle checked={false} onChange={() => {}} label="Order history sharing" description="Share order data for personalized recommendations" />
          </SettingsSection>

          <Card className="border-red-200 p-5 dark:border-red-900/30">
            <h3 className="font-serif text-base font-semibold text-text">Danger Zone</h3>
            <p className="mt-1 text-sm text-text-muted">Once you delete your account, there is no going back.</p>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="text-red-500 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          CHANGE PASSWORD TAB
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'password' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl font-bold text-text">Change Password</h1>
            <p className="mt-1 text-sm text-text-muted">Keep your account secure with a strong password</p>
          </div>

          <PasswordChangeForm />

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-sage-600 dark:bg-sage-800/40 dark:text-sage-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold text-text">Security Tips</h3>
                <ul className="mt-2 space-y-1.5 text-xs text-text-muted">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sage-500" /> Use at least 8 characters with a mix of letters, numbers, and symbols</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sage-500" /> Avoid using the same password across multiple sites</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sage-500" /> Change your password every 3–6 months</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-sage-500" /> Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ── Helper components ─────────────────────────────────────── */

function SettingsSection({ icon: Icon, title, children }: { icon: typeof Bell; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-caramel-100 text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-serif text-base font-bold text-text">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function PasswordChangeForm() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.current) e.current = 'Current password is required';
    if (!form.next) e.next = 'New password is required';
    else if (form.next.length < 8) e.next = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.next)) e.next = 'Include at least one uppercase letter';
    else if (!/[0-9]/.test(form.next)) e.next = 'Include at least one number';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.next !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const strength = (() => {
    const pw = form.next;
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  })();

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-400', 'bg-caramel-400', 'bg-sage-400', 'bg-sage-500'];

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current password */}
        <div className="relative">
          <Input
            label="Current Password"
            name="current"
            type={showPasswords.current ? 'text' : 'password'}
            placeholder="Enter current password"
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            error={errors.current}
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
          >
            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* New password */}
        <div className="relative">
          <Input
            label="New Password"
            name="next"
            type={showPasswords.next ? 'text' : 'password'}
            placeholder="Enter new password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            error={errors.next}
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, next: !showPasswords.next })}
            className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
          >
            {showPasswords.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Strength meter */}
        {form.next && (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn('h-1.5 flex-1 rounded-full transition-colors', i < strength ? strengthColors[strength - 1] : 'bg-surface-hover')}
                />
              ))}
            </div>
            <p className="text-xs text-text-muted">
              Password strength: <span className="font-medium text-text">{strengthLabels[Math.max(0, strength - 1)] || 'Too short'}</span>
            </p>
          </div>
        )}

        {/* Confirm password */}
        <div className="relative">
          <Input
            label="Confirm New Password"
            name="confirm"
            type={showPasswords.confirm ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            error={errors.confirm}
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
          >
            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-sage-300 bg-sage-50 px-4 py-3 text-sm text-sage-700 dark:border-sage-700 dark:bg-sage-900/20 dark:text-sage-300"
          >
            <Check className="h-4 w-4" />
            Password updated successfully!
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            <KeyRound className="h-4 w-4" />
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
