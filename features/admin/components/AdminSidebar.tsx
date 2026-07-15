"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Box,
  MessageCircle,
  BarChart3,
  X,
} from "lucide-react";
import { useEffect, useCallback } from "react";
import { adminNavItems } from "../utils/formatting";

// Map icon names to actual components
const iconMap = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Box,
  MessageCircle,
  BarChart3,
} as const;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  /* Close on Escape key */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  /* Close on route change */
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const sidebarContent = (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border-default bg-bg-surface">
      {/* Logo area */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-border-default">
        <Link
          href="/"
          className="font-heading text-lg font-normal text-text-primary hover:text-accent-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-md"
        >
          Bloom & Bind
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        <ul className="flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = iconMap[item.iconName];

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-0",
                    isActive
                      ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] shadow-clay-sm"
                      : "text-text-muted hover:bg-bg-elevated hover:text-text-primary hover:shadow-clay-sm hover:translate-y-[-1px]",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop: fixed sidebar */}
      <div className="hidden md:block h-full shrink-0">{sidebarContent}</div>

      {/* Mobile: overlay */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
            type="button"
          />
          {/* Pull-in panel */}
          <section
            className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] animate-slide-in-left md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Admin sidebar"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] z-10"
              aria-label="Close sidebar"
              type="button"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {sidebarContent}
          </section>
        </>
      )}
    </>
  );
}