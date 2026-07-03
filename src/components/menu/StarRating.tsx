import { Star, StarHalf } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

/**
 * StarRating — renders 5 stars (full/half/empty) from a numeric rating.
 * Optionally shows the numeric value and review count.
 */
export default function StarRating({
  rating,
  size = 'sm',
  showNumber = false,
  reviewCount,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const roundedFull = rating - fullStars >= 0.75 ? fullStars + 1 : fullStars;
  const emptyStars = 5 - roundedFull - (hasHalf ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: roundedFull }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(sizeMap[size], 'fill-caramel-400 text-caramel-400')}
          />
        ))}
        {hasHalf && (
          <StarHalf
            key="half"
            className={cn(sizeMap[size], 'fill-caramel-400 text-caramel-400')}
          />
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(sizeMap[size], 'text-border')}
          />
        ))}
      </div>
      {showNumber && (
        <div className={cn('flex items-center gap-1', textSizeMap[size])}>
          <span className="font-medium text-text">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span className="text-text-muted">({reviewCount})</span>
          )}
        </div>
      )}
    </div>
  );
}
