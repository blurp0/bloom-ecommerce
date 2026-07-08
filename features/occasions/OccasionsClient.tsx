"use client";

import { useState } from "react";
import { useProducts } from "@/features/product/hooks/useProducts";
import ProductGrid from "@/features/product/components/ProductGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCardGrid } from "@/components/shared/Skeletons";
import Link from "next/link";

type Occasion = {
  slug: string;
  label: string;
  emoji: string;
  description: string;
};

const OCCASIONS: Occasion[] = [
  { slug: "wedding",      label: "Wedding",      emoji: "💍", description: "Elegant arrangements for your special day." },
  { slug: "birthday",     label: "Birthday",     emoji: "🎂", description: "Bright and cheerful bouquets to celebrate." },
  { slug: "anniversary",  label: "Anniversary",  emoji: "🥂", description: "Romantic arrangements for milestone moments." },
  { slug: "romance",      label: "Romance",      emoji: "🌹", description: "Intimate bouquets for dates and declarations." },
  { slug: "graduation",   label: "Graduation",   emoji: "🎓", description: "Vibrant bouquets to celebrate achievements." },
  { slug: "sympathy",     label: "Sympathy",     emoji: "🕊️", description: "Gentle arrangements to offer comfort." },
  { slug: "get-well",     label: "Get Well",     emoji: "🌻", description: "Uplifting arrangements to brighten recovery." },
  { slug: "just-because", label: "Just Because", emoji: "🎁", description: "Surprise someone special for no reason at all." },
];

function OccasionProducts({ occasion }: { occasion: Occasion }) {
  const { data, isLoading, isError } = useProducts({ occasion: occasion.slug });
  const products = data?.products ?? [];

  if (isLoading) return <SkeletonCardGrid count={4} />;

  if (isError)
    return (
      <EmptyState
        title="Something Went Wrong"
        description="We couldn't load products. Please try again."
      />
    );

  if (products.length === 0)
    return (
      <EmptyState
        title="Nothing Here Yet"
        description={`We don't have any bouquets for ${occasion.label} yet.`}
        primaryAction={
          <Link
            href="/products"
            className="clay-button inline-block px-5 py-2 rounded-xl bg-[var(--accent-secondary)] text-[var(--accent-secondary-foreground)] text-sm font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            Start Shopping
          </Link>
        }
      />
    );

  return <ProductGrid products={products} />;
}

export default function OccasionsClient() {
  const [selected, setSelected] = useState<Occasion | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-section-title text-text-primary">
          Shop by Occasion
        </h1>
        <p className="mt-2 text-body text-text-muted max-w-2xl">
          Choose an occasion below to see our curated bouquet recommendations.
        </p>
      </div>

      {/* Occasion picker */}
      <div
        className="clay-card rounded-[16px] border border-border-default bg-bg-elevated p-6"
        role="group"
        aria-label="Occasion selector"
      >
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.map((occasion) => {
            const isActive = selected?.slug === occasion.slug;
            return (
              <button
                key={occasion.slug}
                onClick={() => setSelected(isActive ? null : occasion)}
                aria-pressed={isActive}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium",
                  "border transition-all duration-200 ease-out cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                  isActive
                    ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-[var(--accent-primary-foreground)] shadow-clay-sm"
                    : "bg-bg-surface border-[var(--border-interactive)] text-text-primary hover:bg-bg-elevated hover:border-[var(--accent-primary)]",
                ].join(" ")}
              >
                <span aria-hidden="true">{occasion.emoji}</span>
                {occasion.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected occasion header + products */}
      {selected && (
        <div className="flex flex-col gap-6">
          {/* Occasion header */}
          <div className="clay-card rounded-[16px] border border-border-default bg-bg-elevated px-8 py-8">
            <h2 className="font-heading text-section-title text-text-primary">
              {selected.emoji} {selected.label} Bouquets
            </h2>
            <p className="mt-2 font-body text-body text-text-muted max-w-2xl">
              {selected.description}
            </p>
          </div>

          {/* Products */}
          <OccasionProducts occasion={selected} />
        </div>
      )}

      {/* Prompt when nothing is selected */}
      {!selected && (
        <p className="text-sm text-text-muted text-center py-4">
          Select an occasion above to see recommended bouquets.
        </p>
      )}
    </div>
  );
}
