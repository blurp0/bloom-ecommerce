import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';

// ── Types ─────────────────────────────────────────────

export interface ReviewResult {
  id: string;
  rating: number;
  text: string | null;
  createdAt: Date;
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

// ── Prisma Types ───────────────────────────────────────

const reviewWithUserInclude = {
  user: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ReviewInclude;

type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: typeof reviewWithUserInclude;
}>;

// ── Exports ───────────────────────────────────────────

/**
 * Fetch paginated reviews for a product with stats.
 * Public endpoint — no auth required.
 * Returns newest reviews first, 20 per page.
 */
export async function getProductReviews(
  productId: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaginatedReviews> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    const err = new Error('Product not found');
    (err as NodeJS.ErrnoException).code = '404';
    throw err;
  }

  const skip = (page - 1) * limit;

  // Fetch reviews for this product (newest first)
  const reviewsData = (await prisma.review.findMany({
    where: { productId },
    include: reviewWithUserInclude,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit + 1, // +1 to check if more exist
  })) as ReviewWithUser[];

  const hasMore = reviewsData.length > limit;
  const paginatedReviews = reviewsData.slice(0, limit);

  // Transform to ReviewResult (use first name only)
  const transformedReviews: ReviewResult[] = paginatedReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.comment,
    createdAt: r.createdAt,
    authorName: r.user.name ? r.user.name.split(' ')[0] : 'Anonymous',
  }));

  // Calculate stats
  const stats = await getReviewStats(productId);

  return {
    reviews: transformedReviews,
    stats,
    hasMore,
  };
}

/**
 * Get rating statistics for a product.
 * Computes average and total count on-the-fly.
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: {
      rating: true,
    },
    _count: true,
  });

  return {
    averageRating: result._avg.rating ?? 0,
    totalReviews: result._count,
  };
}

/**
 * Check if a user is eligible to review a product.
 * Eligibility: user must have a DELIVERED order containing this product.
 * Returns true/false and details about any existing review.
 */
export async function checkReviewEligibility(
  userId: string,
  productId: string,
): Promise<{
  isEligible: boolean;
  hasReviewed: boolean;
  orderIds: string[];
}> {
  // Find all DELIVERED orders for this user that contain this product
  const eligibleOrders = await prisma.order.findMany({
    where: {
      userId,
      status: 'DELIVERED',
      items: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  const orderIds = eligibleOrders.map(o => o.id);
  const isEligible = orderIds.length > 0;

  // Check if already reviewed (any order for this product/user)
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
    select: { id: true },
  });

  return {
    isEligible,
    hasReviewed: !!existingReview,
    orderIds,
  };
}

/**
 * Create a review for a product.
 * User must have a DELIVERED order for this product.
 * Enforces unique constraint: one review per [userId, orderId].
 *
 * Throws:
 * - 404 if product or order not found
 * - 403 if order not owned by user or not DELIVERED
 * - 400 if already reviewed this order
 */
export async function createReview(
  userId: string,
  orderId: string,
  productId: string,
  rating: number,
  text?: string,
): Promise<ReviewResult> {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    const err = new Error('User not found');
    (err as NodeJS.ErrnoException).code = '404';
    throw err;
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    const err = new Error('Product not found');
    (err as NodeJS.ErrnoException).code = '404';
    throw err;
  }

  // Verify order exists, is owned by user, and is DELIVERED
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true },
  });

  if (!order) {
    const err = new Error('Order not found');
    (err as NodeJS.ErrnoException).code = '404';
    throw err;
  }

  if (order.userId !== userId) {
    const err = new Error('Order not owned by user');
    (err as NodeJS.ErrnoException).code = '403';
    throw err;
  }

  if (order.status !== 'DELIVERED') {
    const err = new Error('Order must be delivered to review');
    (err as NodeJS.ErrnoException).code = '400';
    throw err;
  }

  // Check if already reviewed (unique constraint on [userId, orderId])
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_orderId: { userId, orderId },
    },
    select: { id: true },
  });

  if (existingReview) {
    const err = new Error('You have already reviewed this order');
    (err as NodeJS.ErrnoException).code = '400';
    throw err;
  }

  // Verify product is in this order
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderId,
      productId,
    },
    select: { id: true },
  });

  if (!orderItem) {
    const err = new Error('Product not in this order');
    (err as NodeJS.ErrnoException).code = '400';
    throw err;
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId,
      orderId,
      productId,
      rating,
      comment: text || null,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  });

  return {
    id: review.id,
    rating: review.rating,
    text: review.comment,
    createdAt: review.createdAt,
    authorName: user.name ? user.name.split(' ')[0] : 'Anonymous',
  };
}
