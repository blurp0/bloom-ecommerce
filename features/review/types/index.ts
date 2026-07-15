import type { CreateReviewInput } from "@/lib/validators/review";

export interface ReviewResult {
  id: string;
  rating: number;
  text: string | null;
  createdAt: Date;
  authorName: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  text: string | null;
  createdAt: string;
  authorName: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface PaginatedReviews {
  reviews: ReviewResult[];
  stats: ReviewStats;
  hasMore: boolean;
}

export interface FetchReviewsResponse {
  data: {
    reviews: ReviewItem[];
    stats: ReviewStats;
    hasMore: boolean;
  };
}

export interface UseReviewsReturn {
  reviews: ReviewItem[];
  stats: ReviewStats;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadOlder: () => void;
  isLoadOlderLoading: boolean;
}

export type { CreateReviewInput };
