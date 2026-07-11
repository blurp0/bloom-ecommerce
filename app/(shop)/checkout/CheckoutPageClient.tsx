"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import CheckoutShell from "@/features/checkout/components/CheckoutShell";

/**
 * CheckoutPageClient — auth-gated client component for the checkout flow.
 *
 * Redirects unauthenticated users to sign-in with redirect_url back to /checkout.
 * Renders breadcrumbs and the checkout shell once authenticated.
 */
export default function CheckoutPageClient() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      const returnUrl = encodeURIComponent("/checkout");
      router.push(`/sign-in?redirect_url=${returnUrl}`);
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link
          href="/"
          className="hover:text-[var(--accent-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
        >
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/cart"
          className="hover:text-[var(--accent-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
        >
          Cart
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text-primary)] font-medium" aria-current="page">
          Checkout
        </span>
      </nav>

      {/* Page heading */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Checkout
        </h1>
      </div>

      {/* Checkout shell */}
      <CheckoutShell />
    </div>
  );
}