"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { useProducts } from "@/features/product/hooks/useProducts";
import ProductGrid from "@/features/product/components/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";

const OCCASION_LINKS = [
    { label: "Wedding", href: "/products?occasion=Wedding" },
    { label: "Birthday", href: "/products?occasion=Birthday" },
    { label: "Anniversary", href: "/products?occasion=Anniversary" },
    { label: "Sympathy", href: "/products?occasion=Sympathy" },
];

function OccasionLinks() {
    return (
        <div className="flex flex-col items-center gap-3 mt-2">
            <p className="text-sm font-medium text-text-muted">Browse by Occasion</p>
            <div className="flex flex-wrap justify-center gap-3">
                {OCCASION_LINKS.map(({ label, href }) => (
                    <Link
                        key={label}
                        href={href}
                        className="px-4 py-2 rounded-full border border-[var(--border-interactive)] text-sm font-medium text-text-primary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                    >
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

import { Suspense } from "react";

function SearchPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get("q") ?? "";

    const { data, isLoading, isError } = useProducts(q ? { search: q } : {});
    const products = data?.products ?? [];

    return (
        <main id="skip-content" className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
            {/* Page heading */}
            <div className="mb-8">
                <h1 className="font-heading text-3xl text-text-primary">
                    {q ? `Search Results for "${q}"` : "Search Products"}
                </h1>
                {!isLoading && !isError && q && (
                    <p className="mt-1 text-sm text-text-muted">
                        {products.length} {products.length === 1 ? "result" : "results"} found
                    </p>
                )}
            </div>

            {/* Mobile search form */}
            <form
                role="search"
                className="lg:hidden mb-6 flex gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const val = (fd.get("q") as string).trim();
                    if (val) router.push(`/search?q=${encodeURIComponent(val)}`);
                }}
            >
                <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    key={q}
                    placeholder="Search products…"
                    aria-label="Search products"
                    className="flex-1 h-10 rounded-lg border border-[var(--border-interactive)] bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors"
                />
                <button
                    type="submit"
                    aria-label="Submit search"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-accent-secondary text-white hover:bg-accent-secondary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary"
                >
                    <Search className="h-5 w-5" aria-hidden="true" />
                </button>
            </form>

            {/* Loading */}
            {isLoading && <SkeletonCardGrid count={8} />}

            {/* Error */}
            {isError && !isLoading && (
                <EmptyState
                    title="Something Went Wrong"
                    description="We couldn't load search results. Please try again."
                    primaryAction={
                        <button
                            onClick={() => router.refresh()}
                            className="clay-button px-5 py-2 rounded-xl bg-accent-secondary text-white text-sm font-medium cursor-pointer"
                        >
                            Try Again
                        </button>
                    }
                />
            )}

            {/* Results */}
            {!isLoading && !isError && products.length > 0 && (
                <ProductGrid products={products} />
            )}

            {/* Empty state — no results for query */}
            {!isLoading && !isError && products.length === 0 && q && (
                <EmptyState
                    title={`No Results Found for "${q}"`}
                    description="Try a different search term, or browse by occasion below."
                    primaryAction={
                        <button
                            onClick={() => router.push("/products")}
                            className="clay-button px-5 py-2 rounded-xl bg-accent-secondary text-white text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                        >
                            View All Products
                        </button>
                    }
                    secondaryAction={<OccasionLinks />}
                />
            )}

            {/* No query — prompt to search */}
            {!isLoading && !isError && !q && (
                <EmptyState
                    title="What Are You Looking For?"
                    description="Type a search term above to find products."
                    icon={<Search className="h-10 w-10" aria-hidden="true" />}
                />
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SkeletonCardGrid count={8} />}>
            <SearchPageInner />
        </Suspense>
    );
}
