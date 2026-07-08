import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";
import ProductDetail from "@/features/product/components/ProductDetail";

interface ProductPageParams {
  params: Promise<{ id: string }>;
}

const productInclude = {
  category: true,
  images: { orderBy: { order: "asc" as const } },
  variants: { orderBy: { price: "asc" as const } },
  reviews: {
    orderBy: { createdAt: "desc" as const },
    include: { user: { select: { name: true } } },
  },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

/** cuid() IDs are 25 chars, alphanumeric. Reject anything else early. */
const VALID_ID = /^[a-z0-9]{20,30}$/i;

async function fetchProduct(id: string): Promise<ProductWithRelations | null> {
  if (!VALID_ID.test(id)) return null;
  return prisma.product.findFirst({
    where: { id, isActive: true },
    include: productInclude,
  });
}

function toDetailData(product: ProductWithRelations) {
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : null;

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    basePrice: Number(product.basePrice),
    category: product.category
      ? { name: product.category.name, slug: product.category.slug }
      : null,
    images: product.images,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
    })),
    averageRating:
      averageRating !== null ? Math.round(averageRating * 10) / 10 : null,
    reviewCount,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: { name: r.user.name },
    })),
  };
}

export async function generateMetadata({
  params,
}: ProductPageParams): Promise<Metadata> {
  const { id } = await params;
  const raw = await fetchProduct(id);

  if (!raw) {
    return { title: "Product Not Found | Bloom & Bind" };
  }

  const description = raw.description
    ? raw.description.slice(0, 155)
    : "Handcrafted crochet and artificial flower bouquets made to order.";

  return {
    title: `${raw.name} | Bloom & Bind`,
    description,
  };
}

/**
 * Product Detail Page (PDP)
 *
 * Server component: fetches product data, renders breadcrumbs,
 * and delegates interactive UI to ProductDetail (client component).
 *
 * Returns 404 for missing or inactive products.
 */
export default async function ProductDetailPage({
  params,
}: ProductPageParams) {
  const { id } = await params;
  const raw = await fetchProduct(id);

  if (!raw) notFound();

  const product = toDetailData(raw);

  return (
    <div className="flex flex-col gap-6 pb-24 lg:pb-0">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm font-body flex-wrap">
          <li>
            <Link
              href="/"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors duration-150"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </li>
          {product.category && (
            <>
              <li>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors duration-150"
                >
                  {product.category.name}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </li>
            </>
          )}
          <li
            className="text-[var(--text-muted)] truncate max-w-[200px]"
            aria-current="page"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Interactive product detail */}
      <ProductDetail product={product} />
    </div>
  );
}
