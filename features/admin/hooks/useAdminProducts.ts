"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import type {
  AdminProductQuery,
  AdminCreateProductInput,
  AdminUpdateProductInput,
} from "@/lib/validators/product";
import type { AdminProductListResult, AdminProductDetailResult } from "@/lib/dal/product";

// ── Types ─────────────────────────────────────────────

interface PaginatedAdminProducts {
  products: AdminProductListResult[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

// ── Helpers ───────────────────────────────────────────

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Something went wrong");
  return json.data as T;
}

function buildQueryString(params: AdminProductQuery): string {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page));
  qs.set("limit", String(params.limit));
  qs.set("sort", params.sort);
  if (params.search) qs.set("search", params.search);
  return qs.toString();
}

// ── Queries ───────────────────────────────────────────

export function useAdminProducts(params: AdminProductQuery) {
  const { isLoaded, isSignedIn } = useUser();
  return useQuery<PaginatedAdminProducts>({
    queryKey: ["admin-products", params],
    queryFn: () => fetchJson(`/api/admin/products?${buildQueryString(params)}`),
    enabled: isLoaded && !!isSignedIn,
  });
}

export function useAdminProduct(id: string | null) {
  const { isLoaded, isSignedIn } = useUser();
  return useQuery<AdminProductDetailResult>({
    queryKey: ["admin-product", id],
    queryFn: () => fetchJson(`/api/admin/products/${id}`),
    enabled: isLoaded && !!isSignedIn && !!id,
  });
}

export function useAdminCategories() {
  const { isLoaded, isSignedIn } = useUser();
  return useQuery<CategoryOption[]>({
    queryKey: ["admin-categories"],
    queryFn: () => fetchJson("/api/admin/categories"),
    enabled: isLoaded && !!isSignedIn,
    staleTime: 5 * 60 * 1000, // categories rarely change
  });
}

// ── Mutations ─────────────────────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateProductInput) =>
      fetchJson<AdminProductDetailResult>("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateProductInput }) =>
      fetchJson<AdminProductDetailResult>(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-product", variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson<{ id: string }>(`/api/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      fetchJson<{ deleted: number }>("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useToggleProductStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      fetchJson<{ id: string; isActive: boolean }>(
        `/api/admin/products/${id}/toggle-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive }),
        },
      ),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: ["admin-products"] });
      const prev = qc.getQueriesData<PaginatedAdminProducts>({ queryKey: ["admin-products"] });

      qc.setQueriesData<PaginatedAdminProducts>(
        { queryKey: ["admin-products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            products: old.products.map((p) =>
              p.id === id ? { ...p, isActive } : p,
            ),
          };
        },
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        for (const [key, data] of context.prev) {
          qc.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
