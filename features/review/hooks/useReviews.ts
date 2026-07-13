'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────

export interface ReviewItem {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  authorName: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface FetchReviewsResponse {
  data: {
    reviews: ReviewItem[];
    stats: ReviewStats;
    hasMore: boolean;
  };
}

interface UseReviewsReturn {
  reviews: ReviewItem[];
  stats: ReviewStats;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadOlder: () => void;
  isLoadOlderLoading: boolean;
}

// ── Fetch helper ──────────────────────────────────────

async function fetchReviews(
  productId: string,
  page: number,
  limit: number = 20,
): Promise<FetchReviewsResponse> {
  const url = `/api/products/${productId}/reviews?page=${page}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Product not found' : 'Failed to fetch reviews');
  }
  return res.json();
}

// ── Hook ──────────────────────────────────────────────

/**
 * TanStack Query hook for fetching paginated product reviews.
 * Caches for 5 minutes. Merges reviews from all loaded pages
 * so loadOlder appends older reviews without replacing the current view.
 */
export function useReviews(productId: string): UseReviewsReturn {
  // Track all fetched pages so we can merge them
  const [pageData, setPageData] = useState<Map<number, ReviewItem[]>>(new Map());

  const [pages, setPages] = useState<number[]>([1]);
  const latestPage = pages[pages.length - 1];

  const {
    data,
    isLoading: isQueryLoading,
    error,
  } = useQuery({
    queryKey: ['products', productId, 'reviews', latestPage],
    queryFn: () => fetchReviews(productId, latestPage),
    staleTime: 5 * 60 * 1000,
    enabled: !!productId,
  });

  // Store fetched page data on success
  if (data?.data.reviews && !pageData.has(latestPage)) {
    setPageData((prev) => {
      const next = new Map(prev);
      next.set(latestPage, data.data.reviews);
      return next;
    });
  }

  // Merge reviews from all loaded pages in descending page order (newest first)
  const allReviews: ReviewItem[] = [];
  const sortedPages = [...pages].sort((a, b) => a - b); // page 1 = newest, page 2 = older
  for (const page of sortedPages) {
    const pageReviews = pageData.get(page);
    if (pageReviews) {
      allReviews.push(...pageReviews);
    }
  }

  const stats: ReviewStats = data?.data?.stats ?? { averageRating: 0, totalReviews: 0 };
  const hasMore = data?.data?.hasMore ?? false;

  const loadOlder = () => {
    if (!hasMore || isQueryLoading) return;
    setPages((prev) => [...prev, latestPage + 1]);
  };

  return {
    reviews: allReviews,
    stats,
    isLoading: pages.length === 1 && isQueryLoading,
    error: error as Error | null,
    hasMore,
    loadOlder,
    isLoadOlderLoading: pages.length > 1 && isQueryLoading,
  };
}