"use client";

import { Menu } from "lucide-react";

interface AdminNavToggleProps {
  onClick: () => void;
}

export default function AdminNavToggle({ onClick }: AdminNavToggleProps) {
  return (
    <button
      onClick={onClick}
      className="md:hidden inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-0"
      aria-label="Open sidebar"
      type="button"
    >
      <Menu className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}