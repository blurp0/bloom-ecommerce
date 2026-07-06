import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/occasions", label: "Occasions" },
    { href: "/customization/custom-request", label: "Custom" },
];

export default function Navbar() {
    return (
        <header className="sticky top-0 z-20 w-full bg-bg-surface border-b border-border-default">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
                {/* Left: Logo */}
                <Link
                    href="/"
                    className="font-heading text-xl font-normal text-text-primary hover:text-accent-secondary transition-colors shrink-0"
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
                                className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    {/* Search — visible on desktop only */}
                    <Link
                        href="/search"
                        className="hidden lg:inline-flex items-center justify-center h-10 w-10 rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" aria-hidden="true" />
                    </Link>

                    {/* Cart with badge placeholder */}
                    <Link
                        href="/cart"
                        className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors"
                        aria-label="Cart"
                    >
                        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-secondary px-1 text-[10px] font-bold text-white">
                            0
                        </span>
                    </Link>

                    {/* Account */}
                    <Link
                        href="/account"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors"
                        aria-label="Account"
                    >
                        <User className="h-5 w-5" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </header>
    );
}