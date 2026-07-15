// ── Address ───────────────────────────────────────────

export interface CheckoutAddress {
  fullName: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  /** Optional saved address ID — null for new addresses */
  addressId?: string | null;
  /** Optional label for new addresses (e.g. "Home", "Office") */
  label?: string;
}

// ── Delivery & Payment Enums ──────────────────────────

export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

export type PaymentMethod = "COD" | "EWALLET" | "MANUAL";

// ── Step ──────────────────────────────────────────────

/** Checkout flow step indices (1-indexed for display). */
export type CheckoutStep = 1 | 2 | 3 | 4;

// ── Store State & Actions ─────────────────────────────

export interface CheckoutState {
  /** Current step index (1–4) */
  step: CheckoutStep;
  /** Delivery address information */
  address: CheckoutAddress;
  /** Preferred delivery date (ISO string, YYYY-MM-DD) */
  deliveryDate: string;
  /** Preferred time slot */
  timeSlot: TimeSlot | null;
  /** Selected payment method */
  paymentMethod: PaymentMethod | null;
  /** Whether an order submission is in flight */
  isSubmitting: boolean;
}

export interface CheckoutActions {
  /** Navigate to a specific step */
  setStep: (step: CheckoutStep) => void;
  /** Update one or more address fields */
  setAddress: (partial: Partial<CheckoutAddress>) => void;
  /** Set the preferred delivery date */
  setDeliveryDate: (date: string) => void;
  /** Set the preferred time slot */
  setTimeSlot: (slot: TimeSlot | null) => void;
  /** Set the payment method */
  setPaymentMethod: (method: PaymentMethod | null) => void;
  /** Set submitting state */
  setSubmitting: (submitting: boolean) => void;
  /** Reset the entire store to initial values */
  reset: () => void;
}

export type CheckoutStore = CheckoutState & CheckoutActions;

// ── Order Creation ────────────────────────────────────

export interface CreateOrderInput {
  addressId: string;
  deliveryDate: string;
  timeSlot: TimeSlot;
  paymentMethod: PaymentMethod;
  selectedItemIds: string[];
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  estimatedDelivery: string | null;
}