import { prisma } from "@/lib/prisma/client";
import { ProductQuerySchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";
import type { z } from "zod";

// ── Prisma Includes ────────────────────────────────────

const productListInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { price: "asc" as const } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

const productDetailInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { price: "asc" as const } },
  addOns: true,
  reviews: {
    orderBy: { createdAt: "desc" as const },
    include: {
      user: { select: { name: true } },
    },
  },
  inventory: true,
} satisfies Prisma.ProductInclude;

// ── Result Types ───────────────────────────────────────

type ReviewRating = ProductListItem["reviews"][number];
type VariantPrice = ProductListItem["variants"][number];

export interface ProductListResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  occasionTags: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: { url: string; alt: string | null; order: number }[];
  variants: { id: string; name: string; price: number }[];
  averageRating: number | null;
  reviewCount: number;
}

export interface ProductDetailResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categoryId: string;
  category: { id: string; name: string; slug: string } | null;
  occasionTags: string[];
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: { url: string; alt: string | null; order: number }[];
  variants: { id: string; name: string; price: number; size?: string; color?: string }[];
  addOns: { id: string; name: string; price: number; category?: string }[];
  averageRating: number | null;
  reviewCount: number;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { name: string | null };
  }[];
  inventory: { quantity: number; lowStock: number } | null;
}

export interface PaginatedProducts {
  products: ProductListResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ── Helpers ────────────────────────────────────────────

function formatProductListItem(product: ProductListItem): ProductListResult {
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum: number, r: ReviewRating) => sum + r.rating, 0) /
          reviewCount
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
    averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    reviewCount,
  };
}

function formatProductDetail(product: Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>): ProductDetailResult {
  type DetailReviewItem = typeof product.reviews[number];
  type DetailVariantItem = typeof product.variants[number];
  type DetailAddOnItem = typeof product.addOns[number];

  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum: number, r: DetailReviewItem) => sum + r.rating, 0) /
        reviewCount
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
    variants: product.variants.map((v: DetailVariantItem) => ({
      ...v,
      price: Number(v.price),
    })),
    addOns: product.addOns.map((a: DetailAddOnItem) => ({
      ...a,
      price: Number(a.price),
    })),
    averageRating: averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    reviewCount,
    reviews: product.reviews,
    inventory: product.inventory
      ? {
          quantity: product.inventory.quantity,
          lowStock: product.inventory.lowStock,
        }
      : null,
  };
}

// ── Exports ────────────────────────────────────────────

/**
 * List active products matching search/filter params.
 * Public — no auth required.
 */
export async function getProducts(
  filters: z.infer<typeof ProductQuerySchema>,
): Promise<PaginatedProducts> {
  const { category, occasion, featured, minPrice, maxPrice, search, page, limit, sort } = filters;

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

    const tokenCount = await prisma.product.count({ where });
    if (tokenCount === 0) {
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
      delete where.AND;
      where.id = { in: trigramFallbackIds };
    }
  }

  // Determine sort order
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
      orderBy = { createdAt: "desc" };
  }

  const total = await prisma.product.count({ where });

  const skip = (page - 1) * limit;

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy,
    ...(isRatingSort ? {} : { skip, take: limit }),
    include: productListInclude,
  });

  const productsWithMetrics = rawProducts.map(formatProductListItem);

  // Rating sort + pagination in-memory (Prisma can't ORDER BY aggregated field)
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

  return {
    products: pagedProducts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single product by ID with full detail.
 * Returns null if not found or inactive.
 * Public — no auth required.
 */
export async function getProductById(id: string): Promise<ProductDetailResult | null> {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
    include: productDetailInclude,
  });

  if (!product) return null;

  return formatProductDetail(product);
}