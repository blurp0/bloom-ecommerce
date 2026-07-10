import type { Metadata } from "next";
import CartPageClient from "./CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart — Bloom & Bind",
  description: "Review your items and proceed to checkout.",
};

/**
 * Cart page — server component shell that renders the client cart UI.
 * 
 * Auth gate: CartPageClient redirects unauthenticated users to sign-in.
 */
export default function CartPage() {
  return <CartPageClient />;
}