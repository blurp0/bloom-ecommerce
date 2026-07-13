'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { useCreateReview } from '../hooks/useCreateReview';

// ── ReviewForm ─────────────────────────────────────────

interface ReviewFormProps {
  productId: string;
  orderId: string;
  onSubmit: () => void; // Called after successful submit to close/reload
  onCancel: () => void;
}

/**
 * ReviewForm — modal overlay form for creating a review.
 *
 * Star rating: click-to-select 1–5, shows current hover selection.
 * Text field: optional, 1–500 chars, shows remaining count.
 * Submit disabled until rating selected and text valid.
 *
 * Full-screen on mobile (<768px), centered modal on desktop.
 */
export default function ReviewForm({ productId, orderId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [text, setText] = useState('');
  const { submitReview, isSubmitting, error } = useCreateReview(productId, orderId);

  const remainingChars = 500 - text.length;
  const isTextValid = !text || text.trim().length > 0;
  const canSubmit = rating > 0 && remainingChars >= 0 && isTextValid && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await submitReview({
        rating,
        text: text.trim() || undefined,
      });
      onSubmit();
    } catch {
      // Error handled by mutation state
    }
  };

  // Close on Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  };

  const displayRating = hoverRating || rating;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Write a review"
        className={[
          'fixed z-50 bg-[var(--bg-surface)] border border-[var(--border-default)]',
          // Mobile: full-screen
          'inset-0 rounded-none',
          // Desktop: centered modal
          'md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2',
          'md:w-full md:max-w-md md:rounded-[20px] md:max-h-[90vh] md:overflow-y-auto',
          'shadow-clay-lg',
        ].join(' ')}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] font-heading">
            Leave a Review
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="h-9 w-9 inline-flex items-center justify-center rounded-[12px] hover:bg-[var(--bg-elevated)] transition-colors duration-200 cursor-pointer"
            aria-label="Close review form"
          >
            <X className="h-5 w-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-[12px] bg-[var(--state-error)]/10 border border-[var(--state-error)]/20 text-sm text-[var(--state-error)]">
              {error.message}
            </div>
          )}

          {/* Star Rating */}
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-[var(--text-primary)]">
              Your Rating *
            </legend>
            <div
              className="flex items-center gap-1.5"
              onMouseLeave={() => setHoverRating(0)}
              aria-label="Select rating 1 to 5 stars"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="h-10 w-10 inline-flex items-center justify-center cursor-pointer rounded-[8px] hover:bg-[var(--bg-elevated)] transition-colors duration-150"
                  aria-label={`${star} star${star === 1 ? '' : 's'}`}
                >
                  <Star
                    className={[
                      'h-7 w-7 transition-colors duration-150',
                      star <= displayRating
                        ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]'
                        : 'fill-none text-[var(--border-default)]',
                    ].join(' ')}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-semibold text-[var(--text-primary)]">
                  {rating} / 5
                </span>
              )}
            </div>
          </fieldset>

          {/* Text Field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="review-text" className="text-sm font-medium text-[var(--text-primary)]">
              Your Review <span className="text-xs text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= 500) setText(e.target.value);
              }}
              rows={4}
              maxLength={500}
              placeholder="Share your thoughts about this product..."
              className={[
                'w-full rounded-[12px] px-3.5 py-3 text-sm',
                'bg-[var(--bg-surface)] border border-[var(--border-interactive)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
                'transition-shadow duration-200',
              ].join(' ')}
            />
            <div className="flex items-center justify-between">
              {remainingChars < 100 ? (
                <span
                  className={[
                    'text-xs',
                    remainingChars < 20 ? 'text-[var(--state-error)] font-semibold' : 'text-[var(--state-warning)]',
                  ].join(' ')}
                >
                  {remainingChars} / 500
                </span>
              ) : (
                <span className="text-xs text-[var(--text-muted)]">
                  {remainingChars} characters remaining
                </span>
              )}
              {text.length > 0 && text.trim().length === 0 && (
                <span className="text-xs text-[var(--state-error)]">
                  Review cannot be only whitespace
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 pt-4 border-t border-[var(--border-default)]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={[
              'inline-flex items-center rounded-[12px] px-5 py-2.5 text-sm font-semibold',
              'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              'bg-[var(--bg-surface)] border border-[var(--border-default)]',
              'hover:bg-[var(--bg-elevated)] active:scale-95',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              'inline-flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-sm font-semibold',
              'text-[var(--accent-secondary-foreground)] bg-[var(--accent-secondary)]',
              'hover:bg-[var(--accent-secondary-hover)] active:scale-95',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            ].join(' ')}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-secondary-foreground)]/30 border-t-[var(--accent-secondary-foreground)]" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </>
  );
}