import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShoppingBag,
  CalendarDays,
  Heart,
  MapPin,
  Bell,
  Settings,
  KeyRound,
  ChevronRight,
  Menu as MenuIcon,
  X,
  LogOut,
} from 'lucide-react';
import Container from '../ui/Container';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCart } from '../../contexts/CartContext';

export type DashboardTab =
  | 'profile'
  | 'orders'
  | 'reservations'
  | 'wishlist'
  | 'addresses'
  | 'notifications'
  | 'settings'
  | 'password';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  children: ReactNode;
  notificationCount: number;
}

const navItems: { id: DashboardTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'reservations', label: 'Reservations', icon: CalendarDays },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'password', label: 'Change Password', icon: KeyRound },
];

export default function DashboardLayout({
  activeTab,
  onTabChange,
  children,
  notificationCount,
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const { favoriteCount } = useFavorites();
  const { itemCount } = useCart();
  const { user } = useAuth();

  const userName = user?.name || 'Guest';
  const userAvatar = user?.name?.charAt(0).toUpperCase() || 'G';
  const userTier = 'Gold';

  const handleTabChange = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileNavOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User card */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-caramel-400 to-caramel-600 font-serif text-lg font-bold text-white">
            {userAvatar}
          </div>
          <div className="min-w-0">
            <p className="truncate font-serif text-base font-bold text-text">
              {userName}
            </p>
            <p className="flex items-center gap-1 text-xs text-text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-caramel-500" />
              {userTier} Member
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const badge =
              item.id === 'wishlist' ? favoriteCount :
              item.id === 'notifications' ? notificationCount :
              0;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-caramel-100 text-accent dark:bg-caramel-900/30 dark:text-caramel-300'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge > 0 && (
                    <span className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                      isActive ? 'bg-accent text-white' : 'bg-surface-hover text-text-muted',
                    )}>
                      {badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 py-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface shadow-soft overflow-hidden">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile nav trigger */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text shadow-soft"
            >
              <span className="flex items-center gap-2">
                <MenuIcon className="h-4 w-4" />
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
              <ChevronRight className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {/* Mobile nav drawer */}
          <AnimatePresence>
            {mobileNavOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileNavOpen(false)}
                  className="absolute inset-0 bg-espresso-950/50 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-elevated"
                >
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <SidebarContent />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </Container>
    </div>
  );
}
