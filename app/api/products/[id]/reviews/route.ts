import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getProductReviews, createReview } from '@/features/review/dal/review';
import { CreateReviewSchema } from '@/lib/validators/review';
import { prisma } from '@/lib/prisma/client';

/**
 * GET /api/products/[id]/reviews
 *
 * Fetch paginated reviews for a product with statistics.
 * Public endpoint — no authentication required.
 * Query params: ?page=1&limit=20
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const result = await getProductReviews(productId, page, limit);

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;

    if (error.code === '404') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.error('[GET /api/products/[id]/reviews]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * POST /api/products/[id]/reviews
 *
 * Create a review for a product.
 * Requires Clerk authentication.
 * User must have a DELIVERED order containing this product.
 * Enforces unique constraint: one review per [userId, orderId].
 *
 * Request body: { rating: 1-5, text?: string }
 * Required query param: ?orderId=<orderId>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;
    const user = await currentUser();

    // 1. Authentication check
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve internal userId from Clerk ID
    const internalUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!internalUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId query parameter is required' }, { status: 400 });
    }

    // 2. Input validation
    const body = await request.json();
    const result = CreateReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      );
    }

    const { rating, text } = result.data;

    // 3. Create review (DAL handles eligibility + ownership checks)
    const review = await createReview(internalUser.id, orderId, productId, rating, text);

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (err) {
    const error = err as NodeJS.ErrnoException;

    // Handle DAL-specific errors (with code set)
    if (error.code === '404') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (error.code === '403') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.code === '400') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic errors
    console.error('[POST /api/products/[id]/reviews]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
