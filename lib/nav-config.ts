import { House, ShoppingBag, Search, ShoppingCart, User } from "lucide-react";

export const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/occasions", label: "Occasions" },
    { href: "/customization/custom-request", label: "Custom" },
];

export const bottomTabs = [
    { href: "/", label: "Home", icon: House },
    { href: "/products", label: "Shop", icon: ShoppingBag },
    { href: "/search", label: "Search", icon: Search },
    { href: "/cart", label: "Cart", icon: ShoppingCart },
    { href: "/account", label: "Account", icon: User },
];
