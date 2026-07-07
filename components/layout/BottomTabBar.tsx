"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomTabs as tabs } from "@/lib/nav-config";

export default function BottomTabBar() {
    const pathname = usePathname();

    function isActive(href: string): boolean {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname === href || pathname.startsWith(href + "/");
    }

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-20 flex h-16 items-center justify-center gap-2 bg-bg-surface border-t border-border-default lg:hidden"
            style={{
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
                touchAction: "manipulation",
            }}
        >
            {tabs.map((tab) => {
                const active = isActive(tab.href);
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0 rounded-md ${active
                            ? "text-accent-secondary"
                            : "text-text-muted"
                            }`}
                        aria-label={tab.label}
                        aria-current={active ? "page" : undefined}
                    >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-[10px] font-medium leading-tight">
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}