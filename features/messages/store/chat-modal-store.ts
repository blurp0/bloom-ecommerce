import { create } from "zustand";

interface ChatModalStore {
  open: boolean;
  /** Pre-select this orderId when modal opens */
  targetOrderId: string | null;
  /** Open the chat modal, optionally pre-selecting an order */
  openModal: (orderId?: string) => void;
  /** Close the chat modal */
  closeModal: () => void;
}

/**
 * Global Zustand store for controlling the FloatingMessageModal.
 *
 * Any component can call openModal(orderId) to open the chat hub
 * with a specific order's chat room pre-selected.
 */
export const useChatModalStore = create<ChatModalStore>((set) => ({
  open: false,
  targetOrderId: null,

  openModal: (orderId?: string) => {
    set({ open: true, targetOrderId: orderId ?? null });
  },

  closeModal: () => {
    set({ open: false, targetOrderId: null });
  },
}));
