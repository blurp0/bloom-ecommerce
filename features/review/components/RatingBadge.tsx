'use client';

import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  count: number;
  /** Size variant — 'small' for cards, 'default' for PDP */
  size?: 'small' | 'default';
  /** Optional href for linking to reviews section */
  href?: string;
}

/**
 * RatingBadge — compact star rating + review count display.
 *
 * "default" (PDP): ⭐ 4.8 (127 reviews) — larger, clickable
 * "small" (cards): ⭐ 4.8 (127) — smaller, no link
 *
 * When count is 0, shows "No ratings yet" in muted text.
 */
export default function RatingBadge({ rating, count, size = 'default', href }: RatingBadgeProps) {
  const isSmall = size === 'small';

  if (count === 0) {
    return (
      <span
        className={[
          'text-[var(--text-muted)]',
          isSmall ? 'text-xs' : 'text-sm',
        ].join(' ')}
      >
        No ratings yet
      </span>
    );
  }

  const displayRating = Math.round(rating * 10) / 10;
  const starSize = isSmall ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = isSmall ? 'text-xs' : 'text-sm';
  const gap = isSmall ? 'gap-1' : 'gap-2';

  const content = (
    <div className={`inline-flex items-center ${gap}`}>
      <Star
        className={`${starSize} fill-[var(--accent-primary)] text-[var(--accent-primary)]`}
        aria-hidden="true"
      />
      <span className={`${textSize} font-semibold text-[var(--text-primary)]`}>
        {displayRating}
      </span>
      <span className={`${textSize} text-[var(--text-muted)]`}>
        ({count} {isSmall ? '' : count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="cursor-pointer"
        aria-label={`Rated ${displayRating} out of 5 based on ${count} ${count === 1 ? 'review' : 'reviews'}. Click to see reviews.`}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      aria-label={`Rated ${displayRating} out of 5 based on ${count} ${count === 1 ? 'review' : 'reviews'}`}
    >
      {content}
    </div>
  );
}