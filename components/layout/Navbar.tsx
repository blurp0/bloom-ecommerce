"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { useRef, useState } from "react";
import { navLinks } from "@/lib/nav-config";
import NavAccountButton from "./NavAccountButton";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isSearchPage = pathname === "/search";
    const inputRef = useRef<HTMLInputElement>(null);

    // Derive the displayed query directly from the URL during render.
    // No useEffect — the value is always in sync with searchParams without
    // an extra render cycle.
    const urlQuery = isSearchPage ? (searchParams.get("q") ?? "") : "";

    // Local state tracks only characters the user is currently typing.
    // It is reset whenever urlQuery changes (i.e. the URL-driven value
    // differs from what we're tracking), avoiding the setState-in-effect
    // pattern while still keeping the input controlled.
    const [query, setQuery] = useState(urlQuery);
    const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
    if (prevUrlQuery !== urlQuery) {
        setPrevUrlQuery(urlQuery);
        if (query !== urlQuery) {
            setQuery(urlQuery);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    }


    return (
        <header className="sticky top-0 z-20 w-full bg-bg-surface border-b border-border-default">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Left: Logo */}
                <Link
                    href="/"
                    className="font-heading text-xl font-normal text-text-primary hover:text-accent-secondary transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
                >
                    Bloom & Bind
                </Link>

                {/* Right: Nav links + Icon buttons */}
                <div className="flex items-center gap-3">
                    <nav className="hidden lg:flex lg:items-center lg:gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0 rounded-md px-1"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search form — desktop */}
                    <form
                        onSubmit={handleSubmit}
                        role="search"
                        className="hidden lg:flex items-center gap-1"
                    >
                        <input
                            ref={inputRef}
                            type="search"
                            name="q"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products…"
                            aria-label="Search products"
                            className="h-9 w-48 rounded-lg border border-[var(--border-interactive)] bg-bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors"
                        />
                        <button
                            type="submit"
                            aria-label="Submit search"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
                        >
                            <Search className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </form>

                    {/* Search icon — mobile only */}
                    <Link
                        href="/search"
                        className="lg:hidden inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" aria-hidden="true" />
                    </Link>

                    {/* Cart with badge placeholder */}
                    <Link
                        href="/cart"
                        className="relative inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-secondary px-1 text-[10px] font-bold text-white">
                            0
                        </span>
                    </Link>

                    {/* Account */}
                    <NavAccountButton />
                </div>
            </div>
        </header>
    );
}
