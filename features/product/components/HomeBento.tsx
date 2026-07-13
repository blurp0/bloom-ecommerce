"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles } from "lucide-react"
import { BentoGrid } from "@/components/shared/BentoGrid"
import { useProducts } from "@/features/product/hooks/useProducts"
import { Skeleton } from "@/components/ui/skeleton"

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const OCCASION_TILES = [
  { label: "Weddings", emoji: "💍", slug: "wedding" },
  { label: "Birthdays", emoji: "🎂", slug: "birthday" },
  { label: "Anniversary", emoji: "🥂", slug: "anniversary" },
  { label: "Just Because", emoji: "🎁", slug: "just-because" },
]

export function HomeBento() {
  const router = useRouter()
  const { data, isLoading } = useProducts({ featured: true, limit: 2 })
  const featuredProducts = data?.products ?? []

  return (
    <section className="w-full px-6 md:px-12 py-16">
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-2"
            style={{ color: "var(--accent-secondary)" }}
          >
            Curated for You
          </p>
          <h2
            className="text-[32px] leading-[38px]"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Find Your Perfect Bloom
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
          style={{ color: "var(--accent-secondary)" }}
        >
          View All
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* Bento grid — 4 cols desktop, 1 col mobile */}
      <BentoGrid columns={4} gap="md" className="auto-rows-[200px]">

        {/* ── Tile 1: Occasion showcase — col-span-2 row-span-2 ── */}
        <div
          role="link"
          tabIndex={0}
          onClick={() => router.push("/occasions")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              router.push("/occasions")
            }
          }}
          className="bento-occasion-bg clay-card clay-hover-lift relative overflow-hidden col-span-1 md:col-span-2 md:row-span-2 border cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none group"
          style={{ borderColor: "var(--border-default)" }}
          aria-label="Shop by occasion"
        >
          {/* Decorative large emoji */}
          <div
            className="absolute -right-4 -top-4 text-[120px] opacity-20 select-none"
            aria-hidden="true"
          >
            🌸
          </div>

          {/* Occasion pill chips — each links to /occasions?occasion=slug */}
          <div className="absolute top-6 left-6 right-6 flex flex-wrap gap-2">
            {OCCASION_TILES.map((o) => (
              <Link
                key={o.slug}
                href={`/occasions?occasion=${o.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="bento-occasion-pill inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
                style={{ color: "var(--text-primary)" }}
              >
                {o.emoji} {o.label}
              </Link>
            ))}
          </div>

          {/* Bottom copy */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p
              className="text-[22px] leading-7 font-semibold mb-1"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
            >
              Shop by Occasion
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Weddings, birthdays, anniversaries & more
            </p>
            <span
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: "var(--accent-secondary)" }}
            >
              Explore all occasions <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* ── Tiles 2 & 3: Featured products — col-span-1 each ── */}
        {isLoading ? (
          <>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="col-span-1 rounded-[16px] overflow-hidden border"
                style={{ borderColor: "var(--border-default)" }}
                aria-hidden="true"
              >
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </>
        ) : (
          featuredProducts.slice(0, 2).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="clay-card clay-hover-lift relative overflow-hidden col-span-1 border cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none group"
              style={{ borderColor: "var(--border-default)" }}
            >
              {product.images?.[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt ?? product.name}
                  fill
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              ) : (
                <div className="bento-product-fallback absolute inset-0" aria-hidden="true" />
              )}
              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}
                aria-hidden="true"
              />
              {/* Price badge */}
              <div className="absolute top-3 right-3">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "var(--bg-surface)", color: "var(--text-primary)" }}
                >
                  {formatPrice(product.basePrice)}
                </span>
              </div>
              {/* Name + hover CTA */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-semibold leading-5 line-clamp-2">
                  {product.name}
                </p>
                <span
                  className="mt-1 inline-flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "var(--accent-primary)" }}
                >
                  View Details <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))
        )}

        {/* ── Tile 4: Custom request CTA — col-span-2 ── */}
        <div
          className="bento-cta-bg clay-card col-span-1 md:col-span-2 relative overflow-hidden border flex flex-col justify-between p-6"
          style={{ borderColor: "var(--border-default)" }}
        >
          <span
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[72px] opacity-15 select-none"
            aria-hidden="true"
          >
            ✂️
          </span>

          <div className="flex flex-col gap-2 relative z-10">
            <span
              className="bento-bespoke-pill inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ color: "var(--accent-secondary)" }}
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Bespoke
            </span>
            <p
              className="text-[22px] leading-7 font-semibold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
            >
              Design Your Own
            </p>
            <p className="text-sm leading-5" style={{ color: "var(--text-muted)" }}>
              Share your vision — we&apos;ll craft it just for you.
            </p>
          </div>

          <Link
            href="/customization/custom-request"
            className="clay-button relative z-10 mt-4 self-start inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
            style={{
              backgroundColor: "var(--accent-secondary)",
              color: "var(--accent-secondary-foreground)",
            }}
          >
            Start Custom Request
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

      </BentoGrid>

      {/* Mobile "View All" link */}
      <div className="mt-6 flex justify-center md:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
          style={{ color: "var(--accent-secondary)" }}
        >
          View All Products
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
