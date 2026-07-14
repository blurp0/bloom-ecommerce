import { create } from "zustand";

interface MessageStore {
  /** Unread message count per order, keyed by orderId. */
  unreadByOrder: Record<string, number>;
  /** Increment unread count for an order. */
  incrementUnread: (orderId: string) => void;
  /** Reset unread count for an order to 0. */
  clearUnread: (orderId: string) => void;
  /** Get unread count for an order. */
  getUnread: (orderId: string) => number;
}

/**
 * In-memory Zustand store for unread message counts.
 *
 * Keyed by orderId. Persists within a single browser tab session.
 * Resets on hard page reload (MVP scope — no server-side read tracking).
 */
export const useMessageStore = create<MessageStore>((set, get) => ({
  unreadByOrder: {},

  incrementUnread: (orderId: string) => {
    set((state) => ({
      unreadByOrder: {
        ...state.unreadByOrder,
        [orderId]: (state.unreadByOrder[orderId] ?? 0) + 1,
      },
    }));
  },

  clearUnread: (orderId: string) => {
    set((state) => ({
      unreadByOrder: {
        ...state.unreadByOrder,
        [orderId]: 0,
      },
    }));
  },

  getUnread: (orderId: string): number => {
    return get().unreadByOrder[orderId] ?? 0;
  },
}));
