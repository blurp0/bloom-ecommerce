import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { CustomizationLanding } from "@/features/customization/components";

export const metadata: Metadata = {
  title: "Customize a Bouquet | Bloom & Bind",
  description:
    "Pick a pre-designed bouquet to personalize, or submit a custom request for your dream design.",
};

/**
 * Customization landing page — the hub for all customization flows.
 *
 * Two paths:
 * 1. Browse suggested pre-made products → click to enter the studio
 * 2. Submit a custom request → describe your ideal bouquet
 */
export default function CustomizationLandingPage() {
  return (
    <div className="flex flex-col gap-10 pb-24 lg:pb-0">
      {/* Hero section */}
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-[2rem] leading-tight lg:text-[2.5rem] text-[var(--text-primary)]">
          Create Your Perfect Bouquet
        </h1>
        <p className="text-base text-[var(--text-muted)] max-w-2xl">
          Start with one of our handcrafted designs and make it yours — choose
          the size, colors, add-ons, and include a personal message. Or tell us
          what you envision and we&rsquo;ll bring it to life.
        </p>
      </div>

      {/* Custom request CTA card */}
      <Link
        href="/customization/custom-request"
        className={[
          "group relative flex items-center gap-5 p-6 rounded-[16px]",
          "border-2 border-dashed border-[var(--accent-primary)]",
          "bg-[var(--bg-elevated)]",
          "transition-all duration-200",
          "hover:border-[var(--accent-secondary)] hover:shadow-md hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
          "cursor-pointer",
        ].join(" ")}
      >
        <div className="flex-shrink-0 w-14 h-14 rounded-[12px] bg-[var(--accent-primary)] flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-[var(--accent-primary-foreground)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Want Something Unique?
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Tell us your flower preferences, colors, and budget — we&rsquo;ll
            create a custom proposal just for you.
          </p>
        </div>
        <ArrowRight
          className="h-5 w-5 text-[var(--accent-primary)] flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--border-default)]" />
        <span className="text-sm font-medium text-[var(--text-muted)]">
          or choose a design to customize
        </span>
        <hr className="flex-1 border-[var(--border-default)]" />
      </div>

      {/* Suggested products grid */}
      <CustomizationLanding />
    </div>
  );
}