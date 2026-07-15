import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Admin — Bloom & Bind",
};

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Analytics
      </h1>
      <p className="mt-2 text-text-muted text-sm">Analytics dashboard coming soon.</p>
    </div>
  );
}