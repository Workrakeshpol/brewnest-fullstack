import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, Menu as MenuIcon, X, ShoppingBag, Heart, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import Container from '../ui/Container';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/menu', label: 'Menu' },
  { to: '/locations', label: 'Locations' },
  { to: '/contact', label: 'Contact' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { itemCount, setCartOpen } = useCart();
  const { favoriteCount } = useFavorites();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg/80 backdrop-blur-lg border-b border-border shadow-soft'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <Container size="xl">
        <nav className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="BrewNest home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-espresso-800 text-cream-50 transition-transform group-hover:scale-105 dark:bg-caramel-500 dark:text-espresso-950">
              <Coffee className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-text">
              Brew<span className="text-accent">Nest</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                      isActive
                        ? 'text-accent'
                        : 'text-text-muted hover:text-text hover:bg-surface-hover',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-hover transition-colors"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-hover transition-colors"
              aria-label={`Wishlist with ${favoriteCount} items`}
            >
              <Heart className="h-5 w-5" />
              {favoriteCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface pl-1.5 pr-3 text-text hover:bg-surface-hover transition-colors"
                  aria-label="User menu"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-espresso-800 text-xs font-bold text-cream-50 dark:bg-caramel-500 dark:text-espresso-950">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface py-2 shadow-card">
                    <div className="border-b border-border px-4 py-2">
                      <p className="truncate text-sm font-medium text-text">{user.name}</p>
                      <p className="truncate text-xs text-text-muted">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-text hover:bg-surface-hover transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text hover:bg-surface-hover transition-colors md:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 bottom-0 z-40 bg-bg/95 backdrop-blur-lg transition-all duration-300 md:hidden',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        <Container size="xl">
          <ul className="flex flex-col gap-1 pt-8">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-4 text-lg font-medium transition-colors',
                      isActive
                        ? 'bg-surface-hover text-accent'
                        : 'text-text hover:bg-surface-hover',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 flex gap-3 border-t border-border pt-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-surface-hover text-accent'
                      : 'text-text hover:bg-surface-hover',
                  )
                }
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-surface-hover text-accent'
                      : 'text-text hover:bg-surface-hover',
                  )
                }
              >
                <Heart className="h-5 w-5" />
                Wishlist
                {favoriteCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </NavLink>
            </li>
            <li className="flex gap-3">
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setCartOpen(true);
                }}
                className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium text-text hover:bg-surface-hover transition-colors text-left w-full cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </li>
            <li className="flex gap-3 border-t border-border pt-4">
              {user ? (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-surface-hover text-accent'
                        : 'text-text hover:bg-surface-hover',
                    )
                  }
                >
                  <User className="h-5 w-5" />
                  {user.name?.split(' ')[0] || 'Account'}
                </NavLink>
              ) : (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    cn(
                      'flex flex-1 items-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-surface-hover text-accent'
                        : 'text-text hover:bg-surface-hover',
                    )
                  }
                >
                  <User className="h-5 w-5" />
                  Sign In
                </NavLink>
              )}
            </li>
          </ul>
        </Container>
      </div>
    </motion.header>
  );
}
