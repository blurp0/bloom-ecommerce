import type { Metadata } from "next";
import { CustomRequestForm } from "@/features/customization/components/CustomRequestForm";

export const metadata: Metadata = {
  title: "Custom Request | Bloom & Bind",
};

export default function CustomRequestPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <CustomRequestForm />
    </div>
  );
}
