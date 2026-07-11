import type { OrderStatus } from "@prisma/client";

/**
 * Valid state transitions for the order lifecycle.
 * PENDING is the initial state set at creation and cannot be a target.
 * DELIVERED and CANCELLED are terminal states.
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Returns true only if `to` is a valid next state from `from`.
 */
export function isValidTransition(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}