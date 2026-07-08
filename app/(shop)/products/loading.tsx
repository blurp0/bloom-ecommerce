import { Skeleton } from "@/components/ui/skeleton";

/**
 * ProductsPageSkeleton — loading placeholder for the product catalog page.
 *
 * Renders a skeleton grid matching the ProductGrid layout (4 columns on
 * large desktop, 3 on desktop, 2 on tablet, 1 on mobile) with card-shaped
 * skeleton placeholders.
 *
 * This is used both as the route-level loading.tsx (Next.js Suspense
 * boundary) and as the fallback for the inner Suspense boundary in
 * page.tsx.
 */
export function ProductsPageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {/* Skeleton page header */}
      <div>
        <Skeleton className="h-9 w-56 rounded-md" />
        <Skeleton className="mt-2 h-5 w-96 max-w-full rounded-md" />
      </div>

      {/* Skeleton grid */}
      <div
        aria-hidden="true"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col overflow-hidden rounded-[16px] border border-border-default bg-surface"
          >
            {/* Image placeholder */}
            <Skeleton className="aspect-[4/3] w-full rounded-none" />

            {/* Content placeholders */}
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-5 w-1/3 rounded-md" />
              <div className="mt-1 flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-20 rounded-md" />
                <Skeleton className="h-3.5 w-8 rounded-md" />
              </div>
              <div className="mt-1">
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Default export — Next.js uses this as the route-level loading.tsx.
 */
export default function Loading() {
  return <ProductsPageSkeleton />;
}