import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Instagram, Twitter, Facebook, Mail, MapPin, Clock } from 'lucide-react';
import Container from '../ui/Container';
import { newsletterApi } from '../../lib/api';

const quickLinks = [
  { to: '/about', label: 'Our Story' },
  { to: '/menu', label: 'Menu' },
  { to: '/locations', label: 'Locations' },
  { to: '/contact', label: 'Contact' },
  { to: '/cart', label: 'Cart' },
  { to: '/wishlist', label: 'Wishlist' },
] as const;

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
] as const;

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await newsletterApi.subscribe(email);
      setStatus('success');
      setMessage(res.message || 'Successfully subscribed!');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong.');
    }
  };

  return (
    <footer className="border-t border-border bg-espresso-50 dark:bg-espresso-950">
      <Container size="xl">
        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-espresso-800 text-cream-50 dark:bg-caramel-500 dark:text-espresso-950">
                <Coffee className="h-5 w-5" />
              </span>
              <span className="font-serif text-xl font-bold text-text">
                Brew<span className="text-accent">Nest</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              A specialty cafe crafting thoughtfully sourced coffee in a warm,
              welcoming space. Every cup tells a story.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-text">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Visit Us */}
          <div className="space-y-6">
            <div>
              <h3 className="flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-wider text-text">
                <Clock className="h-4 w-4 text-accent" />
                Hours
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-text-muted">
                <li className="flex justify-between gap-4">
                  <span>Mon – Fri</span>
                  <span className="text-text">7am – 7pm</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span className="text-text">8am – 8pm</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span>Sunday</span>
                  <span className="text-text">8am – 5pm</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-wider text-text">
                <MapPin className="h-4 w-4 text-accent" />
                Visit Us
              </h3>
              <p className="mt-3 text-sm text-text-muted leading-relaxed">
                128 Maple Street<br />Portland, OR 97201
              </p>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="flex items-center gap-2 font-serif text-sm font-semibold uppercase tracking-wider text-text">
              <Mail className="h-4 w-4 text-accent" />
              Stay Brewed
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Subscribe to get brewing guides, seasonal recipe releases, and exclusive invites.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
              <div className="flex rounded-full border border-border bg-surface p-1 focus-within:border-accent transition-colors">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-text outline-none placeholder:text-text-muted/50"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent/95 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {status === 'loading' ? '...' : 'Join'}
                </button>
              </div>
              {status === 'success' && (
                <p className="px-2 text-xs text-sage-600 dark:text-sage-400">{message}</p>
              )}
              {status === 'error' && (
                <p className="px-2 text-xs text-red-500">{message}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} BrewNest Cafe. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Crafted with care, served with love.
          </p>
        </div>
      </Container>
    </footer>
  );
}
