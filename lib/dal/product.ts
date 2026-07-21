import { prisma } from "@/lib/prisma/client";
import {
  ProductQuerySchema,
  type AdminProductQuery,
  type AdminCreateProductInput,
  type AdminUpdateProductInput,
} from "@/lib/validators/product";
import { Prisma } from "@prisma/client";
import type { z } from "zod";

// ── Prisma Includes ────────────────────────────────────

const productListInclude = {
  categories: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { price: "asc" as const } },
  reviews: { select: { rating: true } },
} satisfies Prisma.ProductInclude;

type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

const productDetailInclude = {
  categories: true,
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
  categories: { id: string; name: string; slug: string }[];
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
  categories: { id: string; name: string; slug: string }[];
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
    categories: product.categories,
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
    categories: product.categories,
    featured: product.featured,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: product.images,
    variants: product.variants.map((v: DetailVariantItem) => ({
      ...v,
      price: Number(v.price),
      color: v.color ?? undefined,
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
  const { category, featured, minPrice, maxPrice, search, page, limit, sort } = filters;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (category) {
    where.categories = { some: { slug: category } };
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

// ── Admin Includes & Types ────────────────────────────

const adminProductListInclude = {
  categories: true,
  images: { take: 1, orderBy: { order: "asc" as const } },
  variants: true,
  inventory: true,
} satisfies Prisma.ProductInclude;

const adminProductDetailInclude = {
  categories: true,
  images: { orderBy: { order: "asc" as const } },
  variants: true,
  addOns: true,
  inventory: true,
} satisfies Prisma.ProductInclude;

type AdminProductListRaw = Prisma.ProductGetPayload<{
  include: typeof adminProductListInclude;
}>;

export interface AdminProductListResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categories: { id: string; name: string }[];
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string | null;
  variantCount: number;
  stock: number | null;
}

export interface AdminProductDetailResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  categories: { id: string; name: string }[];
  featured: boolean;
  isActive: boolean;
  images: { url: string; alt: string | null; order: number }[];
  variants: { id: string; name: string; price: number; sku: string | null; color?: string | null }[];
  addOns: { id: string; name: string; price: number }[];
  inventory: { quantity: number; unit: string; lowStock: number } | null;
}

function formatAdminProductListItem(p: AdminProductListRaw): AdminProductListResult {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    categories: p.categories,
    featured: p.featured,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    thumbnail: p.images[0]?.url ?? null,
    variantCount: p.variants.length,
    stock: p.inventory?.quantity ?? null,
  };
}

function formatAdminProductDetail(
  p: Prisma.ProductGetPayload<{ include: typeof adminProductDetailInclude }>,
): AdminProductDetailResult {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: Number(p.basePrice),
    categories: p.categories,
    featured: p.featured,
    isActive: p.isActive,
    images: p.images.map((img) => ({
      url: img.url,
      alt: img.alt,
      order: img.order,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sku: v.sku,
      color: v.color ?? null,
    })),
    addOns: p.addOns.map((a) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price),
    })),
    inventory: p.inventory
      ? { quantity: p.inventory.quantity, unit: p.inventory.unit, lowStock: p.inventory.lowStock }
      : null,
  };
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

// ── Admin Queries ─────────────────────────────────────

export async function getProductsAdmin(
  params: AdminProductQuery,
): Promise<{ products: AdminProductListResult[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
  const { page, limit, sort, search } = params;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { categories: { some: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case "name_asc": return { name: "asc" as const };
      case "name_desc": return { name: "desc" as const };
      case "price_asc": return { basePrice: "asc" as const };
      case "price_desc": return { basePrice: "desc" as const };
      // stock sort handled after fetch since inventory is a relation
      case "stock_asc": return { createdAt: "desc" as const };
      case "stock_desc": return { createdAt: "desc" as const };
      default: return { createdAt: "desc" as const };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: adminProductListInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  let formatted = products.map(formatAdminProductListItem);

  // Client-side sort for stock (inventory is a relation, can't orderBy directly)
  if (sort === "stock_asc") {
    formatted.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  } else if (sort === "stock_desc") {
    formatted.sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0));
  }

  return {
    products: formatted,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductByIdAdmin(id: string): Promise<AdminProductDetailResult | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: adminProductDetailInclude,
  });
  if (!product) return null;
  return formatAdminProductDetail(product);
}

// ── Admin Mutations ───────────────────────────────────

export async function createProduct(
  data: AdminCreateProductInput,
): Promise<AdminProductDetailResult> {
  const slug = slugify(data.name);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        basePrice: data.basePrice,
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
        isActive: data.isActive,
        featured: false,
      },
    });

    if (data.images.length > 0) {
      await tx.productImage.createMany({
        data: data.images.map((img, i) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt ?? null,
          order: i,
        })),
      });
    }

    if (data.variants.length > 0) {
      await tx.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId: product.id,
          name: v.name,
          price: v.price,
          color: v.color ?? null,
          sku: v.sku ?? null,
        })),
      });
    }

    if (data.addOns.length > 0) {
      await tx.addOn.createMany({
        data: data.addOns.map((a) => ({
          productId: product.id,
          name: a.name,
          price: a.price,
        })),
      });
    }

    if (data.inventory) {
      await tx.inventory.create({
        data: {
          productId: product.id,
          quantity: data.inventory.quantity,
          unit: data.inventory.unit,
          lowStock: data.inventory.lowStock,
        },
      });
    }

    const full = await tx.product.findUniqueOrThrow({
      where: { id: product.id },
      include: adminProductDetailInclude,
    });
    return formatAdminProductDetail(full);
  });
}

export async function updateProduct(
  id: string,
  data: AdminUpdateProductInput,
): Promise<AdminProductDetailResult | null> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    // Delete existing children that will be replaced
    if (data.images) {
      await tx.productImage.deleteMany({ where: { productId: id } });
    }
    if (data.variants) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
    }
    if (data.addOns) {
      await tx.addOn.deleteMany({ where: { productId: id } });
    }

    // Handle inventory: null = remove, object = upsert, undefined = leave as-is
    if (data.inventory === null) {
      await tx.inventory.deleteMany({ where: { productId: id } });
    } else if (data.inventory) {
      await tx.inventory.upsert({
        where: { productId: id },
        create: {
          productId: id,
          quantity: data.inventory.quantity,
          unit: data.inventory.unit,
          lowStock: data.inventory.lowStock,
        },
        update: {
          quantity: data.inventory.quantity,
          unit: data.inventory.unit,
          lowStock: data.inventory.lowStock,
        },
      });
    }

    // Update product scalars
    const slug = data.name ? slugify(data.name) : undefined;
    await tx.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.categoryIds !== undefined && {
          categories: { set: data.categoryIds.map((cid) => ({ id: cid })) },
        }),
      },
    });

    // Recreate children
    if (data.images) {
      await tx.productImage.createMany({
        data: data.images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: img.alt ?? null,
          order: i,
        })),
      });
    }

    if (data.variants) {
      await tx.productVariant.createMany({
        data: data.variants.map((v) => ({
          productId: id,
          name: v.name,
          price: v.price,
          color: v.color ?? null,
          sku: v.sku ?? null,
        })),
      });
    }

    if (data.addOns) {
      await tx.addOn.createMany({
        data: data.addOns.map((a) => ({
          productId: id,
          name: a.name,
          price: a.price,
        })),
      });
    }

    const full = await tx.product.findUniqueOrThrow({
      where: { id },
      include: adminProductDetailInclude,
    });
    return formatAdminProductDetail(full);
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.product.delete({ where: { id } });
  return true;
}

export async function bulkDeleteProducts(ids: string[]): Promise<number> {
  const result = await prisma.product.deleteMany({
    where: { id: { in: ids } },
  });
  return result.count;
}

export async function toggleProductStatus(
  id: string,
  isActive: boolean,
): Promise<{ id: string; isActive: boolean } | null> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;
  const updated = await prisma.product.update({
    where: { id },
    data: { isActive },
    select: { id: true, isActive: true },
  });
  return updated;
}