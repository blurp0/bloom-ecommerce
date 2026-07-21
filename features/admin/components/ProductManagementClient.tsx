"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Pencil, Trash2, ChevronUp, ChevronDown, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useAdminProducts,
  useDeleteProduct,
  useBulkDeleteProducts,
  useToggleProductStatus,
} from "@/features/admin/hooks/useAdminProducts";
import { ProductForm } from "./ProductForm";
import type { AdminProductListResult } from "@/lib/dal/product";

type SortKey = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc" | "newest";

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export function ProductManagementClient() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Form dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce search
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [search]);

  const { data, isLoading, isError } = useAdminProducts({
    page,
    limit: 20,
    sort,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeleteProduct();
  const bulkDeleteMutation = useBulkDeleteProducts();
  const toggleMutation = useToggleProductStatus();

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  // Sort toggle
  const handleSort = useCallback((column: "name" | "price" | "stock") => {
    setSort((prev) => {
      const asc = `${column}_asc` as SortKey;
      const desc = `${column}_desc` as SortKey;
      return prev === asc ? desc : asc;
    });
  }, []);

  function sortIndicator(column: "name" | "price" | "stock") {
    if (sort === `${column}_asc`) return <ChevronUp className="inline h-3 w-3" />;
    if (sort === `${column}_desc`) return <ChevronDown className="inline h-3 w-3" />;
    return null;
  }

  // Selection
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Actions
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    } catch {
      toast.error("Failed to delete product");
    }
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      const result = await bulkDeleteMutation.mutateAsync(ids);
      toast.success(`${result.deleted} product(s) deleted`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Failed to delete products");
    }
    setBulkDeleteOpen(false);
  };

  const handleToggle = (product: AdminProductListResult) => {
    toggleMutation.mutate(
      { id: product.id, isActive: !product.isActive },
      {
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-[32px] leading-[38px] font-normal text-text-primary">
          Products
        </h1>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete Selected ({selectedIds.size})
            </Button>
          )}
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Create Product
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <p className="text-center py-12 text-text-muted">Failed to load products.</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">No products found</p>
          <p className="text-text-muted text-sm mt-1">
            {debouncedSearch ? "Try a different search term." : "Create your first product to get started."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-default)] bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] text-left text-text-muted">
                <th className="p-3 w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="p-3 w-16">Image</th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("name")}>
                  Name {sortIndicator("name")}
                </th>
                <th className="p-3">Categories</th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("price")}>
                  Price {sortIndicator("price")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("stock")}>
                  Stock {sortIndicator("stock")}
                </th>
                <th className="p-3">Status</th>
                <th className="p-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--border-default)] last:border-0 hover:bg-bg-elevated/50 transition-colors duration-150"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedIds.has(product.id)}
                      onCheckedChange={() => toggleOne(product.id)}
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td className="p-3">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium text-text-primary max-w-[200px] truncate">
                    {product.name}
                  </td>
                  <td className="p-3 text-text-muted text-xs">
                    {product.categories.length > 0
                      ? product.categories.map((c: { name: string }) => c.name).join(", ")
                      : "—"}
                  </td>
                  <td className="p-3 text-text-primary">
                    {formatPHP(product.basePrice)}
                  </td>
                  <td className="p-3">
                    {product.stock !== null ? (
                      <span className={product.stock <= 10 ? "text-red-500 font-medium" : "text-text-primary"}>
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(product)}
                      className="cursor-pointer"
                      aria-label={`Toggle ${product.name} status`}
                    >
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(product.id)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />

      {/* Single Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} Products</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} selected product(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
