import type { Metadata } from "next";
import CheckoutPageClient from "./CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout — Bloom & Bind",
  description: "Complete your order with delivery details and payment method.",
};

/**
 * Checkout page — server component shell that renders the client checkout UI.
 *
 * Auth gate: CheckoutPageClient redirects unauthenticated users to sign-in
 * with redirect_url back to /checkout.
 */
export default function CheckoutPage() {
  return <CheckoutPageClient />;
}