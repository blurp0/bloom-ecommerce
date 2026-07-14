// ── Order List Types ──────────────────────────────────

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  orderTotal: number;
  createdAt: string;
  itemCount: number;
}

// ── Order Detail Types ────────────────────────────────

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  customizations: Record<string, unknown>;
  unitPrice: number;
  itemTotal: number;
}

export interface StatusTimelineEntry {
  status: string;
  label: string;
  date: string | null;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  status: string;
  orderTotal: number;
  deliveryAddress: string;
  deliveryDate: string;
  deliverySlot: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  updatedAt?: string;
  itemCount?: number;
  hasReview?: boolean;
  orderReviewText?: string;
  items: OrderItemDetail[];
  statusTimeline?: StatusTimelineEntry[];
}

// ── Response Envelopes ─────────────────────────────────

export interface OrdersResponse {
  data: OrderListItem[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  data: OrderDetailData;
}

// ── Status Styling ─────────────────────────────────────

export interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  label: string;
}

// ── Reorder Item (minimal shape for POST /api/cart) ────

export interface ReorderItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  customizations: Record<string, unknown>;
}