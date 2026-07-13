'use client';

import { useState } from 'react';
import { CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
  orderId: string;
  orderStatus: string;
  /** The first product in the order. Per-order review covers entire order. */
  productId: string;
  /** Whether the user has already reviewed this order */
  hasExistingReview: boolean;
  /** If already reviewed, the review text snippet */
  existingReviewText?: string;
}

/**
 * ReviewSection — render inside OrderDetail when order is DELIVERED.
 *
 * Shows:
 * - "Leave a Review" button → opens ReviewForm modal
 * - "Review submitted" confirmation if already reviewed
 * - Nothing if order status is not DELIVERED
 */
export default function ReviewSection({
  orderId,
  orderStatus,
  productId,
  hasExistingReview,
  existingReviewText,
}: ReviewSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(hasExistingReview);

  // Only show for DELIVERED orders
  if (orderStatus !== 'DELIVERED') {
    return null;
  }

  // If already reviewed (from initial data or after submit)
  if (hasSubmitted) {
    return (
      <div
        className={[
          'rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-clay-sm',
          'flex items-center gap-3',
        ].join(' ')}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--state-success)]/10">
          <CheckCircle className="h-6 w-6 text-[var(--state-success)]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Review Submitted
          </h3>
          {existingReviewText ? (
            <p className="text-sm text-[var(--text-muted)] mt-0.5 line-clamp-2">
              Your review: &ldquo;{existingReviewText}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Thank you for sharing your feedback!
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-clay-sm">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
          Leave a Review
        </h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Share your experience with this order. Your feedback helps other customers
          and the seller improve.
        </p>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className={[
            'inline-flex items-center gap-2 rounded-[12px] px-5 py-2.5 text-sm font-semibold',
            'text-[var(--accent-secondary-foreground)] bg-[var(--accent-secondary)]',
            'hover:bg-[var(--accent-secondary-hover)] active:scale-95',
            'transition-all duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]',
          ].join(' ')}
        >
          <Star className="h-4 w-4" />
          Write a Review
        </button>
      </div>

      {isFormOpen && (
        <ReviewForm
          productId={productId}
          orderId={orderId}
          onSubmit={() => {
            setIsFormOpen(false);
            setHasSubmitted(true);
            toast.success('Review submitted');
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </>
  );
}