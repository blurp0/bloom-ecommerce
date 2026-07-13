/**
 * Product UI state store (Zustand)
 * Manages product filters, sorting, and pagination UI state
 */

import { create } from "zustand";
import type { ProductFilterParams } from "../types";

interface ProductUIStore {
  // Filter state
  filters: ProductFilterParams;
  setFilters: (filters: ProductFilterParams) => void;
  updateFilter: <K extends keyof ProductFilterParams>(key: K, value: ProductFilterParams[K]) => void;
  clearFilters: () => void;

  // View state
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Mobile menu
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

const defaultFilters: ProductFilterParams = {
  page: 1,
  limit: 12,
  sort: "newest",
};

export const useProductUIStore = create<ProductUIStore>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value, page: 1 }, // Reset to page 1 on filter change
    })),
  clearFilters: () => set({ filters: defaultFilters }),

  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),

  showFilters: false,
  setShowFilters: (show) => set({ showFilters: show }),
}));
