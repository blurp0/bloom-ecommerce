import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { ProductQuerySchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";

/**
 * GET /api/products
 *
 * Lists active products matching search/filter params, returning paginated
 * results with metadata. Public endpoint — no authentication required.
 *
 * Query parameters validated via ProductQuerySchema:
 *   category, occasion, minPrice, maxPrice, search, page, limit, sort
 */

const productListInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { price: "asc" as const } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

type ReviewRating = ProductListItem["reviews"][number];
type VariantPrice = ProductListItem["variants"][number];

export async function GET(request: NextRequest) {
  // 1. Parse and validate query parameters
  const { searchParams } = request.nextUrl;
  const rawParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    rawParams[key] = value;
  });

  const parsed = ProductQuerySchema.safeParse(rawParams);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: `Invalid query parameter: ${firstIssue.path.join(".")} — ${firstIssue.message}`,
      },
      { status: 400 }
    );
  }

  const { category, occasion, featured, minPrice, maxPrice, search, page, limit, sort } = parsed.data;

  try {
    // 2. Build the Prisma where clause
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (occasion) {
      where.occasionTags = { has: occasion };
    }

    if (featured !== undefined) {
      where.featured = featured === "true";
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) {
        where.basePrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.basePrice.lte = maxPrice;
      }
    }

    // Search: token-split exact match first, trigram similarity fallback
    let trigramFallbackIds: string[] | null = null;
    if (search) {
      const tokens = search.trim().split(/\s+/).filter(Boolean);
      where.AND = tokens.map((token) => ({
        OR: [
          { name: { contains: token, mode: "insensitive" } },
          { description: { contains: token, mode: "insensitive" } },
        ],
      }));

      // Check if token search yields results; if not, fall back to trigram
      const tokenCount = await prisma.product.count({ where });
      if (tokenCount === 0) {
        // Trigram similarity: fetch enough rows to cover the requested page.
        // Using offset + limit ensures page 2+ has enough candidates.
        const skip = (page - 1) * limit;
        const trigramLimit = skip + limit;
        const similar = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Product"
          WHERE "isActive" = true
            AND (
              similarity(name, ${search}) > 0.1
              OR similarity(description, ${search}) > 0.1
            )
          ORDER BY GREATEST(similarity(name, ${search}), similarity(description, ${search})) DESC
          LIMIT ${trigramLimit}
        `;
        trigramFallbackIds = similar.map((r) => r.id);
        // Replace where clause with ID list (preserves ordering via Prisma)
        delete where.AND;
        where.id = { in: trigramFallbackIds };
      }
    }

    // 3. Determine sort order
    // For rating_desc we must fetch all matching products and sort in-memory
    // because Prisma cannot ORDER BY an aggregated field inline.
    const isRatingSort = sort === "rating_desc";
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      default:
        // newest — also used as a stable secondary sort for rating_desc
        orderBy = { createdAt: "desc" };
    }

    // 4. Fetch total count for pagination
    const total = await prisma.product.count({ where });

    // 5. Fetch products
    //    For rating_desc: fetch ALL matching rows (no skip/take) so we can
    //    sort by rating first, then paginate the sorted result in memory.
    //    For all other sorts: apply DB-level skip/take directly.
    const skip = (page - 1) * limit;

    const rawProducts = await prisma.product.findMany({
      where,
      orderBy,
      ...(isRatingSort ? {} : { skip, take: limit }),
      include: productListInclude,
    });

    // 6. Compute review metrics and format response
    const productsWithMetrics = rawProducts.map((product: ProductListItem) => {
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce(
              (sum: number, r: ReviewRating) => sum + r.rating,
              0
            ) / reviewCount
          : null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: Number(product.basePrice),
        categoryId: product.categoryId,
        category: product.category,
        occasionTags: product.occasionTags,
        featured: product.featured,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        images: product.images,
        variants: product.variants.map((v: VariantPrice) => ({
          ...v,
          price: Number(v.price),
        })),
        averageRating:
          averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
        reviewCount,
      };
    });

    // 7. Apply rating sort + pagination in-memory (only for rating_desc)
    let pagedProducts = productsWithMetrics;
    if (isRatingSort) {
      pagedProducts = [...productsWithMetrics]
        .sort((a, b) => {
          const aRating = a.averageRating ?? 0;
          const bRating = b.averageRating ?? 0;
          return bRating - aRating;
        })
        .slice(skip, skip + limit);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: {
        products: pagedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("[products] Failed to fetch products:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}