import type { Metadata } from "next";
import OccasionsClient from "@/features/occasions/components/OccasionsClient";

export const metadata: Metadata = {
  title: "Shop by Occasion | Bloom & Bind",
  description:
    "Find the perfect handcrafted crochet or artificial flower bouquet for every occasion — weddings, birthdays, anniversaries, and more.",
};

export default function OccasionsPage() {
  return <OccasionsClient />;
}
