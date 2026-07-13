import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages — Admin — Bloom & Bind",
};

export default function AdminMessagesPage() {
  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
        Messages
      </h1>
      <p className="mt-2 text-text-muted text-sm">Customer messages coming soon.</p>
    </div>
  );
}