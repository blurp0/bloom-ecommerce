"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminNavToggle from "./AdminNavToggle";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useClerk();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-border-default bg-bg-surface px-4 lg:px-6">
          {/* Mobile hamburger */}
          <AdminNavToggle onClick={openSidebar} />

          {/* Logo (clickable → home) */}
          <Link
            href="/"
            className="font-heading text-lg font-normal text-text-primary hover:text-accent-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-md"
          >
            Bloom & Bind
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout button */}
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-text-muted hover:text-state-error hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] cursor-pointer"
            aria-label="Sign out"
            type="button"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}