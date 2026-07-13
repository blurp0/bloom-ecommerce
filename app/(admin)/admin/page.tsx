import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Bloom & Bind",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Dashboard
      </h1>
      <p className="mt-2 text-text-muted text-sm">
        Welcome to the admin dashboard. Select a section from the sidebar to get
        started.
      </p>
    </div>
  );
}