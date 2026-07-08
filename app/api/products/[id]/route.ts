import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

/**
 * GET /api/products/[id]
 *
 * Retrieves detailed information for a single product by ID.
 * Returns 404 if the product is not found or is inactive.
 * Public endpoint — no authentication required.
 */

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

type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

type ReviewItem = ProductDetail["reviews"][number];
type VariantItem = ProductDetail["variants"][number];
type AddOnItem = ProductDetail["addOns"][number];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const product: ProductDetail | null = await prisma.product.findFirst({
      where: { id, isActive: true },
      include: productDetailInclude,
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Compute review metrics
    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? product.reviews.reduce((sum: number, r: ReviewItem) => sum + r.rating, 0) /
          reviewCount
        : null;

    return NextResponse.json({
      data: {
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
        variants: product.variants.map((v: VariantItem) => ({
          ...v,
          price: Number(v.price),
        })),
        addOns: product.addOns.map((a: AddOnItem) => ({
          ...a,
          price: Number(a.price),
        })),
        averageRating:
          averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
        reviewCount,
        reviews: product.reviews,
        inventory: product.inventory
          ? {
              ...product.inventory,
              quantity: product.inventory.quantity,
              lowStock: product.inventory.lowStock,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[products/id] Failed to fetch product:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}