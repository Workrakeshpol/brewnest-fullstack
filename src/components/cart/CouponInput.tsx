import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { cn } from '../../lib/utils';

/**
 * CouponInput — coupon code entry with async API validation and feedback.
 */
export default function CouponInput() {
  const { coupon, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setFeedback(null);
    try {
      const result = await applyCoupon(code);
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
      if (result.success) setCode('');
    } catch {
      setFeedback({ type: 'error', message: 'Unable to validate coupon. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    removeCoupon();
    setFeedback(null);
    setCode('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-sage-300 bg-sage-50 px-4 py-3 dark:border-sage-700 dark:bg-sage-900/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-500 text-white">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">{coupon.code}</p>
            <p className="text-xs text-text-muted">{coupon.label}</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-red-500 transition-colors"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (feedback) setFeedback(null);
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder="Enter coupon code"
            className={cn(
              'h-11 w-full rounded-lg border bg-surface pl-10 pr-4 text-sm uppercase tracking-wide text-text',
              'placeholder:normal-case placeholder:tracking-normal placeholder:text-text-muted/60',
              'border-border focus:border-accent focus:ring-1 focus:ring-accent',
              'transition-colors duration-200 outline-none',
              'disabled:opacity-50',
              feedback?.type === 'error' && 'border-red-400 focus:border-red-400 focus:ring-red-400',
            )}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || loading}
          className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-text hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </button>
      </div>
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={cn(
              'mt-2 flex items-center gap-1.5 text-xs',
              feedback.type === 'success' ? 'text-sage-600 dark:text-sage-400' : 'text-red-500',
            )}
          >
            {feedback.type === 'success' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5" />
            )}
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-2 text-xs text-text-muted">
        Try: WELCOME10, BREWNEST15, SAVE5, or FREESHIP
      </p>
    </div>
  );
}
