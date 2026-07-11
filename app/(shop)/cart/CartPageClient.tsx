"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ShoppingBag, RefreshCw, ClipboardList } from "lucide-react";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/features/cart/hooks/useCart";
import CartLineItem from "@/features/cart/components/CartLineItem";
import CartSummary from "@/features/cart/components/CartSummary";
import { SkeletonCartLineItem } from "@/components/shared/Skeletons";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function CartPageClient() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isLoaded && !userId) {
      const returnUrl = encodeURIComponent("/cart");
      router.push(`/sign-in?redirect_url=${returnUrl}`);
    }
  }, [isLoaded, userId, router]);

  const items = cart?.items ?? [];
  const itemCount = cart?.itemCount ?? 0;

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = items.some((i) => selectedIds.has(i.id));

  const selectedItems = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)),
    [items, selectedIds]
  );
  const selectedCount = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + i.itemTotal, 0);

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    updateCartItem.mutate(
      { itemId, quantity },
      {
        onError: () => {
          toast.error("Couldn't update quantity — please try again");
        },
      }
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
      onError: () => {
        toast.error("Couldn't remove item — please try again");
      },
    });
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Link
            href="/"
            className="hover:text-[var(--accent-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--text-primary)] font-medium" aria-current="page">
            Cart
          </span>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-secondary)] hover:text-[var(--accent-secondary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] rounded-sm"
        >
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          My Orders
        </Link>
      </nav>

      {/* Page heading */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-[var(--text-primary)]">
          Shopping Cart
        </h1>
        {!isLoading && itemCount > 0 && (
          <span className="text-sm text-[var(--text-muted)]">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-4" aria-label="Loading cart items">
            {[1, 2, 3].map((n) => (
              <SkeletonCartLineItem key={n} />
            ))}
          </div>
          {/* Summary skeleton */}
          <div className="lg:w-80 xl:w-96 hidden lg:block">
            <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-clay-md space-y-3">
              <div className="h-4 w-1/2 rounded-md bg-[var(--bg-elevated)] animate-pulse" />
              <div className="h-3 w-full rounded-md bg-[var(--bg-elevated)] animate-pulse" />
              <div className="h-3 w-3/4 rounded-md bg-[var(--bg-elevated)] animate-pulse" />
              <div className="h-px bg-[var(--border-default)]" />
              <div className="h-12 w-full rounded-[12px] bg-[var(--bg-elevated)] animate-pulse" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <p className="text-base text-[var(--state-error)]">
              Couldn&apos;t load your cart. Please try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className={[
                "mt-4 inline-flex items-center gap-2",
                "text-sm font-medium text-[var(--accent-secondary)]",
                "hover:text-[var(--accent-secondary-hover)]",
                "transition-colors cursor-pointer active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
                "rounded-md px-3 py-1.5",
              ].join(" ")}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Try again</span>
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
          <div className="w-32 h-32 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
            <ShoppingBag className="h-14 w-14 text-[var(--text-muted)]" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[var(--text-primary)]">
              Your cart is empty
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              Looks like you haven&apos;t added anything yet.
            </p>
          </div>
          <Link
            href="/products"
            className={[
              "clay-button clay-hover-lift",
              "inline-flex items-center justify-center gap-2",
              "rounded-[12px] px-8 py-3",
              "text-base font-semibold",
              "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)]",
              "hover:bg-[var(--accent-primary-hover)] active:scale-95",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            ].join(" ")}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items list — left column; pb accounts for mobile sticky summary bar */}
          <div className="flex-1 flex flex-col gap-4 pb-[180px] lg:pb-0">
            {/* Select-all row */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="page-select-all"
                checked={allSelected}
                data-state={someSelected && !allSelected ? "indeterminate" : undefined}
                onCheckedChange={handleToggleSelectAll}
                aria-label="Select all items"
                className="cursor-pointer"
              />
              <label
                htmlFor="page-select-all"
                className="text-sm font-medium text-[var(--text-muted)] cursor-pointer select-none"
              >
                Select all
              </label>
              {someSelected && (
                <span className="ml-auto text-sm text-[var(--text-muted)]">
                  {selectedItems.length} of {items.length} selected
                </span>
              )}
            </div>

            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                expandedByDefault
                showCheckbox
                selected={selectedIds.has(item.id)}
                onToggleSelect={handleToggleSelect}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Summary panel — right sidebar (desktop), bottom bar (mobile) */}
          <div className="lg:w-80 xl:w-96">
            {/* Desktop: sticky summary */}
            <aside className="hidden lg:block sticky top-24 self-start">
              <div className="rounded-[16px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-clay-md">
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
                  Order Summary
                </h2>
                <CartSummary
                  subtotal={selectedSubtotal}
                  itemCount={selectedCount}
                  layout="page"
                  onCheckout={handleCheckout}
                  checkoutDisabled={selectedCount === 0}
                />
              </div>
            </aside>

            {/* Mobile: bottom summary bar — safe-area aware */}
            <div className="fixed bottom-0 left-0 right-0 z-20 lg:hidden bg-[var(--bg-surface)] border-t border-[var(--border-default)] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <CartSummary
                subtotal={selectedSubtotal}
                itemCount={selectedCount}
                layout="page"
                onCheckout={handleCheckout}
                checkoutDisabled={selectedCount === 0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
