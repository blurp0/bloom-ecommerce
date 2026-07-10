"use client";

import Link from "next/link";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "../hooks/useCart";
import CartLineItem from "./CartLineItem";
import CartSummary from "./CartSummary";
import { SkeletonCartLineItem } from "@/components/shared/Skeletons";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useState, useMemo, useRef } from "react";

export default function CartDrawer() {
  const { data: cart, isLoading, isError } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = cart?.items ?? [];
  const itemCount = cart?.itemCount ?? 0;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = items.some((i) => selectedIds.has(i.id));

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.itemTotal, 0);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleToggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateCartItem.mutate(
      { itemId, quantity },
      { onError: () => toast.error("Couldn't update quantity — please try again") }
    );
  };

  const handleRemove = (itemId: string) => {
    removeCartItem.mutate(itemId, {
      onSuccess: () => {
        toast.success("Item removed");
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      },
      onError: () => toast.error("Couldn't remove item — please try again"),
    });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* Cart icon — click navigates to /cart */}
      <Link
        href="/cart"
        className="relative inline-flex items-center justify-center h-[44px] w-[44px] rounded-lg text-text-muted hover:text-accent-secondary hover:bg-bg-elevated transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-0"
        aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <ShoppingCart className="h-5 w-5" aria-hidden="true" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-secondary px-1 text-[10px] font-bold text-white">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>

      {/* Floating dropdown panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Cart preview"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className={[
            "absolute right-0 top-[calc(100%+8px)] z-50",
            "w-80 sm:w-96",
            "rounded-[16px] border border-[var(--border-default)]",
            "bg-[var(--bg-surface)] shadow-clay-lg",
            "flex flex-col overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150",
          ].join(" ")}
          style={{ maxHeight: "min(480px, calc(100vh - 80px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Shopping Cart
              </span>
              {itemCount > 0 && (
                <span className="text-xs text-[var(--text-muted)]">
                  ({itemCount} item{itemCount !== 1 ? "s" : ""})
                </span>
              )}
            </div>
            <Link
              href="/cart"
              className="text-xs font-medium text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
            >
              View all →
            </Link>
          </div>

          {/* Select-all row */}
          {!isLoading && !isError && items.length > 0 && (
            <div className="flex items-center gap-2 px-4 pt-3 pb-0">
              <Checkbox
                id="drawer-select-all"
                checked={allSelected}
                data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                onCheckedChange={handleToggleSelectAll}
                aria-label="Select all items"
                className="cursor-pointer"
              />
              <label
                htmlFor="drawer-select-all"
                className="text-xs font-medium text-[var(--text-muted)] cursor-pointer select-none"
              >
                Select all
              </label>
              {someSelected && (
                <span className="ml-auto text-xs text-[var(--text-muted)]">
                  {selectedItems.length} selected
                </span>
              )}
            </div>
          )}

          {/* Items — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
            {isLoading ? (
              <>
                <SkeletonCartLineItem />
                <SkeletonCartLineItem />
              </>
            ) : isError ? (
              <p className="text-sm text-[var(--state-error)] py-4 text-center">
                Couldn&apos;t load your cart. Please try again.
              </p>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7 text-[var(--text-muted)]" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Your cart is empty
                </p>
                <Link
                  href="/products"
                  className="text-xs font-medium text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors"
                >
                  Start shopping →
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  showCheckbox
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={handleToggleSelect}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>

          {/* Footer summary */}
          {items.length > 0 && (
            <div className="border-t border-[var(--border-default)] px-4 py-4">
              <CartSummary
                subtotal={selectedSubtotal}
                itemCount={selectedCount}
                layout="drawer"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
