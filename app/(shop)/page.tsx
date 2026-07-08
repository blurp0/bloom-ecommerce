import { Suspense } from "react"
import type { Metadata } from "next"
import { Hero } from "@/features/product/components/Hero"
import { HomeBento } from "@/features/product/components/HomeBento"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Bloom & Bind — Handcrafted Bouquets",
  description:
    "Discover crochet bouquets and artificial flower arrangements for every occasion, or design something uniquely yours.",
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <Hero />
      <Suspense
        fallback={
          <div className="w-full px-6 md:px-12 py-12">
            <Skeleton className="h-[500px] w-full rounded-[16px]" />
          </div>
        }
      >
        <HomeBento />
      </Suspense>
    </div>
  )
}
