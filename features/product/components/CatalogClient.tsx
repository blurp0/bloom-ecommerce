"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "../hooks/useProducts";
import ProductGrid from "./ProductGrid";
import ProductFilters from "./ProductFilters";
import { ProductsPageSkeleton } from "@/app/(shop)/products/loading";

type CatalogClientProps = {
  categories: Array<{ slug: string; name: string }>;
};

/**
 * CatalogClient — client component that reads URL search params, fetches
 * products via TanStack Query, and renders filters + grid.
 *
 * Must be wrapped in a Suspense boundary because useSearchParams() can
 * deoptimize the whole tree to client-side rendering.
 */
export default function CatalogClient({ categories }: CatalogClientProps) {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <CatalogInner categories={categories} />
    </Suspense>
  );
}

/**
 * Inner component that reads searchParams and fetches products.
 */
function CatalogInner({ categories }: CatalogClientProps) {
  const searchParams = useSearchParams();

  // Build params object from URL search params
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const { data, isFetching, error } = useProducts(params);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Filters sidebar */}
      <ProductFilters categories={categories} />

      {/* Product area */}
      <div className="flex-1">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-body text-text-muted">
              Unable to load products right now. Please try again later.
            </p>
          </div>
        ) : (
          <>
            {/* Results count + active indicator */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                {data?.pagination
                  ? `${data.pagination.total} product${data.pagination.total === 1 ? "" : "s"} found`
                  : "Loading products..."}
              </p>
              {isFetching && (
                <span className="text-caption text-text-muted italic">
                  Updating...
                </span>
              )}
            </div>

            {/* Product grid */}
            <ProductGrid
              products={data?.products ?? []}
              footer={
                data?.pagination && data.pagination.totalPages > 1 ? (
                  <PaginationControls pagination={data.pagination} />
                ) : null
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Pagination controls — rendered below the product grid.
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