import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Package,
  FolderTree,
  Boxes,
  CalendarDays,
  Users,
  UserCog,
  Ticket,
  Star,
  FileBarChart,
  ChevronLeft,
  Menu as MenuIcon,
  X,
  Coffee,
  Bell,
  Search,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type AdminPage =
  | 'dashboard'
  | 'analytics'
  | 'revenue'
  | 'orders'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'reservations'
  | 'customers'
  | 'users'
  | 'coupons'
  | 'reviews'
  | 'reports';

interface AdminLayoutProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: ReactNode;
}

const navGroups: {
  label: string;
  items: { id: AdminPage; label: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'revenue', label: 'Revenue', icon: DollarSign },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'categories', label: 'Categories', icon: FolderTree },
      { id: 'inventory', label: 'Inventory', icon: Boxes },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'orders', label: 'Orders', icon: ShoppingBag },
      { id: 'reservations', label: 'Reservations', icon: CalendarDays },
      { id: 'customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'users', label: 'Users & Staff', icon: UserCog },
      { id: 'coupons', label: 'Coupons', icon: Ticket },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
];

export default function AdminLayout({
  activePage,
  onNavigate,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleNavigate = (page: AdminPage) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-espresso-900 dark:bg-espresso-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-espresso-800 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-caramel-500 text-espresso-950">
          <Coffee className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold text-cream-50">
              BrewNest
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-caramel-400">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-espresso-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-caramel-500 text-espresso-950'
                          : 'text-espresso-200 hover:bg-espresso-800 hover:text-cream-50',
                        collapsed && 'justify-center',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden border-t border-espresso-800 p-3 lg:block">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-espresso-300 hover:bg-espresso-800 hover:text-cream-50 transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && 'Collapse'}
        </button>
      </div>

      {/* Back to site */}
      <div className="border-t border-espresso-800 p-3">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-espresso-300 hover:bg-espresso-800 hover:text-cream-50 transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Back to Site'}
        </Link>
      </div>
    </div>
  );

  const currentLabel = navGroups
    .flatMap((g) => g.items)
    .find((i) => i.id === activePage)?.label;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden shrink-0 transition-all duration-300 lg:block',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-espresso-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-64"
            >
              <Sidebar />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text hover:bg-surface-hover transition-colors lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-xl font-bold text-text">
              {currentLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden items-center sm:flex">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-10 w-48 rounded-full border border-border bg-bg pl-9 pr-4 text-sm text-text placeholder:text-text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-text hover:bg-surface-hover transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </button>

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-caramel-400 to-caramel-600 font-serif text-sm font-bold text-white">
              M
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
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
    </div>
  );
}
