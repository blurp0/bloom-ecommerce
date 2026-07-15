import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders — Admin — Bloom & Bind",
};

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Orders
      </h1>
      <p className="mt-2 text-text-muted text-sm">Order management coming soon.</p>
    </div>
  );
}