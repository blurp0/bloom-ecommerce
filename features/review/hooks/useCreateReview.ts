'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────

interface CreateReviewInput {
  rating: number;
  text?: string;
}

interface CreateReviewResponse {
  data: {
    id: string;
    rating: number;
    text: string | null;
    createdAt: string;
    authorName: string;
  };
}

// ── Hook ──────────────────────────────────────────────

/**
 * TanStack Query mutation for creating a review.
 * POST /api/products/[productId]/reviews?orderId=<orderId>
 * Invalidates product reviews cache on success.
 */
export function useCreateReview(productId: string, orderId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const url = `/api/products/${productId}/reviews?orderId=${encodeURIComponent(orderId)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const body: CreateReviewResponse | { error: string } = await res.json();

      if (!res.ok) {
        throw new Error('error' in body ? body.error : 'Failed to submit review');
      }

      return (body as CreateReviewResponse).data;
    },
    onSuccess: () => {
      // Invalidate reviews cache so PDP refreshes
      queryClient.invalidateQueries({ queryKey: ['products', productId, 'reviews'] });
      // Also invalidate the product detail data to update avgRating
      queryClient.invalidateQueries({ queryKey: ['products', productId] });
    },
  });

  return {
    submitReview: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error as Error | null,
    isSuccess: mutation.isSuccess,
  };
}