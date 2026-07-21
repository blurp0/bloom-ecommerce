import type { Metadata } from "next";
import { ProductManagementClient } from "@/features/admin/components/ProductManagementClient";

export const metadata: Metadata = {
  title: "Products — Admin — Bloom & Bind",
};

export default function AdminProductsPage() {
  return <ProductManagementClient />;
}
