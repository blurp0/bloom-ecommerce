import type { Metadata } from "next";
import CatalogClient from "@/features/product/components/CatalogClient";
import { prisma } from "@/lib/prisma/client";

export const metadata: Metadata = {
  title: "Products — Bloom & Bind",
  description:
    "Browse our collection of handcrafted crochet and artificial flower bouquets. Find the perfect bouquet for any occasion.",
};

/**
 * Products catalog page.
 *
 * Fetches categories server-side and passes them to the client-side
 * CatalogClient which handles URL-synced filtering, search, and
 * data fetching via TanStack Query.
 *
 * The page is a Server Component; the client boundary starts at
 * CatalogClient.
 */
export default async function ProductsPage() {
  // Fetch categories server-side for the filter dropdowns
  const categories = await prisma.category.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

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

      {/* Client-side catalog with filters and product grid */}
      <CatalogClient categories={categories} />
    </div>
  );
}
