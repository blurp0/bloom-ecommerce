import type { ReactNode } from "react";
import ProductCard from "./ProductCard";
import type { ProductCardProduct } from "./ProductCard";

type ProductGridProps = {
  products: ProductCardProduct[];
  /**
   * Optional className override for the grid container.
   * Useful when the grid is embedded in a page with additional layout context.
   */
  className?: string;
  /**
   * An optional ReactNode rendered above the grid, e.g. filter UI or a
   * section heading. This sits outside the grid itself so it doesn't
   * affect column layout.
   */
  header?: ReactNode;
  /**
   * An optional ReactNode rendered below the grid, e.g. pagination controls.
   */
  footer?: ReactNode;
};

/**
 * ProductGrid — a responsive grid wrapper that maps a list of products
 * into ProductCard components.
 *
 * Layout (desktop-first per ui-ux-context.md):
 *   - Large desktop (> 1280px): 4 columns
 *   - Desktop (1024px – 1280px): 3 columns
 *   - Tablet (768px – 1024px): 2 columns
 *   - Mobile (< 768px): 1 column
 *
 * Usage:
 *   <ProductGrid products={products} />
 */
export default function ProductGrid({
  products,
  className = "",
  header,
  footer,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-body text-text-muted">No products found.</p>
      </div>
    );
  }

  return (
    <section aria-label="Product grid" className={className}>
      {header && <div className="mb-6">{header}</div>}

      <div
        className={[
          "grid",
          "grid-cols-1",           // mobile: 1 column
          "md:grid-cols-2",        // tablet: 2 columns
          "lg:grid-cols-3",        // desktop: 3 columns
          "xl:grid-cols-4",        // large desktop: 4 columns
          "gap-6",
        ].join(" ")}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {footer && <div className="mt-8">{footer}</div>}
    </section>
  );
}

import type { ProductsResponse } from "@/features/product/hooks/useProducts";

/**
 * Fetches products from the API and returns a typed response.
 *
 * Used by server components to load product data.
 * Requires NEXT_PUBLIC_APP_URL to be set — throws a clear error if missing
 * so misconfiguration is surfaced immediately rather than silently falling
 * back to localhost (which fails in production).
 */
export async function fetchProducts(
  searchParams?: Record<string, string>
): Promise<ProductsResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set. Cannot resolve the products API URL."
    );
  }

  const params = new URLSearchParams(searchParams ?? {});
  const url = `${appUrl}/api/products?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}