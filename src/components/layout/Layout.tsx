import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout — global page shell with Navbar + Footer.
 * Scrolls to top on every route change.
 */
export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex-1 px-4 md:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
