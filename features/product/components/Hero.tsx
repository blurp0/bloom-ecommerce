import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="hero-bg relative w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-20 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — copy */}
          <div className="flex flex-col gap-6">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 self-start">
              <span
                className="hero-eyebrow-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                style={{ color: "var(--text-primary)" }}
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Handcrafted with love
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-[48px] leading-[52px]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
            >
              Blooms That{" "}
              <span className="relative inline-block" style={{ color: "var(--accent-secondary)" }}>
                Last Forever
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  height="6"
                  viewBox="0 0 200 6"
                  fill="none"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 3 Q25 0 50 3 Q75 6 100 3 Q125 0 150 3 Q175 6 200 3"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base leading-7 max-w-md" style={{ color: "var(--text-muted)" }}>
              Crochet bouquets and artificial flower arrangements crafted for
              every occasion — or design something uniquely yours.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/products"
                className="clay-button inline-flex items-center gap-2 px-6 py-3 text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--accent-primary-foreground)",
                }}
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/customization/custom-request"
                className="clay-button inline-flex items-center gap-2 px-6 py-3 text-sm font-medium cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:outline-none border"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-default)",
                }}
              >
                Custom Request
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-2">
              {["100% Handmade", "Custom Orders", "Lasts Forever"].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "var(--accent-secondary)" }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative visual stack */}
          <div className="relative hidden lg:flex items-center justify-center h-[420px]">
            {/* Background blob */}
            <div
              className="hero-blob-bg absolute inset-0 rounded-[40px] opacity-30"
              aria-hidden="true"
            />

            {/* Main card */}
            <div
              className="clay-card relative z-10 w-[280px] h-[340px] overflow-hidden border"
              style={{ borderColor: "var(--border-default)" }}
              aria-hidden="true"
            >
              <div className="hero-card-fill absolute inset-0" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="text-5xl" aria-hidden="true">💐</span>
                <p
                  className="text-sm font-medium"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                >
                  Bloom & Bind
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Handcrafted bouquets
                </p>
              </div>
            </div>

            {/* Floating card — top right */}
            <div
              className="clay-card absolute top-8 right-4 z-20 px-4 py-3 flex items-center gap-2 border"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              aria-hidden="true"
            >
              <span className="text-lg">✨</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Custom Made
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Just for you</p>
              </div>
            </div>

            {/* Floating card — bottom left */}
            <div
              className="clay-card absolute bottom-10 left-2 z-20 px-4 py-3 flex items-center gap-2 border"
              style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-default)" }}
              aria-hidden="true"
            >
              <span className="text-lg">🌸</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Every Occasion
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  Weddings · Birthdays
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
