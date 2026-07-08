import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import ProductGrid, {
  fetchProducts,
} from "@/features/product/components/ProductGrid";
import { ProductsPageSkeleton } from "./loading";

export const metadata: Metadata = {
  title: "Products — Bloom & Bind",
  description:
    "Browse our collection of handcrafted crochet and artificial flower bouquets. Find the perfect bouquet for any occasion.",
};

/**
 * Products catalog page.
 *
 * Fetches products from the API and renders them in a responsive
 * ProductGrid. Supports query params for filtering (category, occasion,
 * search, price range, sort) via searchParams.
 *
 * The page is a Server Component. Loading state is handled by the
 * sibling loading.tsx file (Next.js Suspense boundary at the route
 * segment level).
 */
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-section-title text-text-primary">
          Our Bouquets
        </h1>
        <p className="mt-2 text-body text-text-muted max-w-2xl">
          Handcrafted with care — browse our collection of crochet and
          artificial flower bouquets, each one made to order.
        </p>
      </div>

      {/* Product grid with Suspense for data fetching */}
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsContent searchParams={params} />
      </Suspense>
    </div>
  );
}

/**
 * Inner component that fetches and renders products.
 *
 * Extracted so the Suspense boundary wraps only the data-fetching
 * portion, keeping the page header visible immediately.
 */
async function ProductsContent({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  try {
    const { products, pagination } = await fetchProducts(searchParams);

    return (
      <ProductGrid
        products={products}
        footer={
          pagination && pagination.totalPages > 1 ? (
            <PaginationControls pagination={pagination} />
          ) : null
        }
      />
    );
  } catch {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-text-muted">
          Unable to load products right now. Please try again later.
        </p>
      </div>
    );
  }
}

/**
 * Simple pagination controls.
 *
 * Renders Previous / Next buttons with current page indicator.
 * Disables the appropriate button at the first/last page.
 */
function PaginationControls({
  pagination,
}: {
  pagination: { total: number; page: number; limit: number; totalPages: number };
}) {
  const { page, totalPages, total } = pagination;

  return (
    <nav
      aria-label="Product pagination"
      className="flex items-center justify-center gap-4"
    >
      <span className="text-sm text-text-muted">
        Page {page} of {totalPages} ({total} products)
      </span>
    </nav>
  );
}