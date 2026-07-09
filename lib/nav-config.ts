import type { LucideIcon } from "lucide-react";
import { House, ShoppingBag, Search, ShoppingCart, User } from "lucide-react";

export type NavLink = { href: string; label: string };
export type TabItem = { href: string; label: string; icon: LucideIcon };

export const navLinks: NavLink[] = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/occasions", label: "Occasions" },
    { href: "/customization", label: "Custom" },
];

export const bottomTabs: TabItem[] = [
    { href: "/", label: "Home", icon: House },
    { href: "/products", label: "Shop", icon: ShoppingBag },
    { href: "/search", label: "Search", icon: Search },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/account", label: "Account", icon: User },
];
