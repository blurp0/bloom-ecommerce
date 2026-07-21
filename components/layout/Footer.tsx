import Link from "next/link";

const shopLinks = [
    { href: "/products", label: "Products" },
    { href: "/customization/custom-request", label: "Custom Request" },
];

const infoLinks = [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
    { href: "/shipping-policy", label: "Shipping Policy" },
    { href: "/returns-policy", label: "Returns Policy" },
];

export default function Footer() {
    return (
        <footer className="w-full bg-bg-surface border-t border-border-default">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Column 1: Brand */}
                    <div>
                        <Link
                            href="/"
                            className="font-heading text-xl font-normal text-text-primary"
                        >
                            Bloom & Bind
                        </Link>
                        <p className="mt-2 text-sm text-text-muted max-w-xs">
                            Handcrafted bouquets for every occasion.
                        </p>
                    </div>

                    {/* Column 2: Shop Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-3">
                            Shop
                        </h3>
                        <ul className="space-y-2">
                            {shopLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Info Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-3">
                            Info
                        </h3>
                        <ul className="space-y-2">
                            {infoLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-text-muted hover:text-text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-border-default">
                    <p className="text-center text-xs text-text-muted">
                        &copy; 2026 Bloom & Bind. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}