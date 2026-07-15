import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory — Admin — Bloom & Bind",
};

export default function AdminInventoryPage() {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Inventory
      </h1>
      <p className="mt-2 text-text-muted text-sm">Inventory tracking coming soon.</p>
    </div>
  );
}