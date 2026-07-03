import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ChevronDown, Quote } from 'lucide-react';
import StarRating from '../menu/StarRating';
import { cn } from '../../lib/utils';

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  helpfulCount: number;
  verified?: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: { stars: number; count: number; percentage: number }[];
}

/**
 * ReviewsSection — rating summary, distribution bars, and review list
 * with helpful voting and expand/collapse.
 */
export default function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
}: ReviewsSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHelpful = (id: string) => {
    setHelpfulVotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      {/* ── Rating Summary ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* Left: big rating */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center">
          <span className="font-serif text-5xl font-bold text-text">
            {averageRating.toFixed(1)}
          </span>
          <div className="mt-2">
            <StarRating rating={averageRating} size="lg" />
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Based on {totalReviews} reviews
          </p>
        </div>

        {/* Right: distribution */}
        <div className="space-y-2">
          {ratingBreakdown.map((tier) => (
            <div key={tier.stars} className="flex items-center gap-3">
              <span className="flex w-12 shrink-0 items-center gap-1 text-xs text-text-muted">
                {tier.stars}
                <span className="text-caramel-400">★</span>
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${tier.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: tier.stars * 0.05 }}
                  className="h-full rounded-full bg-caramel-500 dark:bg-caramel-400"
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs text-text-muted">
                {tier.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Review List ─────────────────────────────────────── */}
      <div className="mt-8 space-y-4">
        {reviews.map((review, i) => {
          const isExpanded = expandedIds.has(review.id);
          const voted = helpfulVotes[review.id];
          const helpfulCount = review.helpfulCount + (voted ? 1 : 0);

          return (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-caramel-100 font-serif text-lg font-bold text-caramel-700 dark:bg-caramel-900/30 dark:text-caramel-300">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{review.author}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[10px] font-medium text-sage-700 dark:bg-sage-800/40 dark:text-sage-300">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-text-muted">{review.date}</span>
                    </div>
                  </div>
                </div>
                <Quote className="h-5 w-5 shrink-0 text-border" />
              </div>

              {/* Body */}
              <h4 className="mt-4 font-serif text-base font-semibold text-text">
                {review.title}
              </h4>
              <p
                className={cn(
                  'mt-2 text-sm leading-relaxed text-text-muted',
                  !isExpanded && 'line-clamp-3',
                )}
              >
                {review.body}
              </p>
              {review.body.length > 200 && (
                <button
                  onClick={() => toggleExpand(review.id)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 transition-transform',
                      isExpanded && 'rotate-180',
                    )}
                  />
                </button>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                    voted ? 'text-accent' : 'text-text-muted hover:text-text',
                  )}
                >
                  <ThumbsUp className={cn('h-3.5 w-3.5', voted && 'fill-current')} />
                  Helpful ({helpfulCount})
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
