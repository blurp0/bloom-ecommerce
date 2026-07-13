/**
 * Admin UI state store (Zustand)
 * Manages sidebar visibility and other admin UI interactions
 */

import { create } from "zustand";

interface AdminUIStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAdminUIStore = create<AdminUIStore>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
