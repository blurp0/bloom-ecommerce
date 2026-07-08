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

  const { category, occasion, minPrice, maxPrice, search, page, limit, sort } = parsed.data;

  try {
    // 2. Build the Prisma where clause
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (occasion) {
      where.occasionTags = { has: occasion };
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
        // Trigram similarity: match products where name or description is
        // similar to the full query (threshold 0.1 — permissive for short names)
        const similar = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Product"
          WHERE "isActive" = true
            AND (
              similarity(name, ${search}) > 0.1
              OR similarity(description, ${search}) > 0.1
            )
          ORDER BY GREATEST(similarity(name, ${search}), similarity(description, ${search})) DESC
          LIMIT ${limit}
        `;
        trigramFallbackIds = similar.map((r) => r.id);
        // Replace where clause with ID list
        delete where.AND;
        where.id = { in: trigramFallbackIds };
      }
    }

    // 3. Determine sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "rating_desc":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // 4. Fetch total count for pagination
    const total = await prisma.product.count({ where });

    // 5. Fetch products for the current page
    const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: { orderBy: { price: "asc" } },
        reviews: { select: { rating: true } },
      },
    });

    // 6. Compute review metrics and format response
    const productsWithMetrics = products.map((product: any) => {
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
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
        variants: product.variants.map((v: any) => ({ ...v, price: Number(v.price) })),
        averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
        reviewCount,
      };
    });

    // 7. Handle rating_desc sort in-memory
    let sortedProducts = productsWithMetrics;
    if (sort === "rating_desc") {
      sortedProducts = [...productsWithMetrics].sort((a: any, b: any) => {
        const aRating = a.averageRating ?? 0;
        const bRating = b.averageRating ?? 0;
        return bRating - aRating;
      });
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: {
        products: sortedProducts,
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