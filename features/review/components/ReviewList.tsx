'use client';

import { Star } from 'lucide-react';
import { type ReviewItem } from '../types';
import { relativeTime } from '@/lib/date';

// ── Skeleton ───────────────────────────────────────────

function ReviewListSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-default)]"
        >
          <div className="flex items-center gap-2 mb-2">
            {/* Star skeleton */}
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <div key={si} className="h-4 w-4 rounded bg-[var(--bg-elevated)]" />
              ))}
            </div>
            {/* Name skeleton */}
            <div className="h-3 w-16 rounded bg-[var(--bg-elevated)]" />
          </div>
          {/* Text skeleton (alternating widths) */}
          <div
            className={[
              'h-4 rounded bg-[var(--bg-elevated)] mb-1',
              i % 2 === 0 ? 'w-3/4' : 'w-1/2',
            ].join(' ')}
          />
          <div className="h-4 w-1/4 rounded bg-[var(--bg-elevated)]" />
        </div>
      ))}
    </div>
  );
}

// ── Empty State ────────────────────────────────────────

function ReviewEmptyState() {
  return (
    <div className="text-center py-10">
      <Star className="mx-auto h-10 w-10 text-[var(--border-default)] mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-[var(--text-muted)]">
        No reviews yet — be the first to share your thoughts!
      </p>
    </div>
  );
}

// ── Single Review ──────────────────────────────────────

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div className="p-4 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-clay-sm">
      <div className="flex items-center gap-2 mb-2">
        {/* Stars */}
        <div className="flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={[
                'h-4 w-4',
                star <= review.rating
                  ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'fill-none text-[var(--border-default)]',
              ].join(' ')}
            />
          ))}
        </div>
        {/* Author + time */}
        <span className="text-xs font-medium text-[var(--text-muted)]">
          {review.authorName}
        </span>
        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {relativeTime(review.createdAt)}
        </span>
      </div>
      {review.text && (
        <p className="text-sm text-[var(--text-primary)] leading-relaxed">
          {review.text}
        </p>
      )}
    </div>
  );
}

// ── ReviewList ─────────────────────────────────────────

interface ReviewListProps {
  reviews: ReviewItem[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadOlder: () => void;
  isLoadOlderLoading: boolean;
}

/**
 * ReviewList — paginated review display for PDP.
 *
 * Shows a list of review cards with stars, author name, relative time,
 * and review text. Includes skeleton, empty state, and "Load Older Reviews"
 * pagination button.
 */
export default function ReviewList({
  reviews,
  isLoading,
  hasMore,
  onLoadOlder,
  isLoadOlderLoading,
}: ReviewListProps) {
  if (isLoading) {
    return <ReviewListSkeleton count={3} />;
  }

  if (reviews.length === 0) {
    return <ReviewEmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={onLoadOlder}
          disabled={isLoadOlderLoading}
          className={[
            'inline-flex items-center gap-2 self-center rounded-[12px] px-5 py-2 text-sm font-semibold',
            'text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-default)]',
            'hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:scale-95',
            'transition-all duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isLoadOlderLoading ? 'Loading...' : 'Load Older Reviews'}
        </button>
      )}
    </div>
  );
}