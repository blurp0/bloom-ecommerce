// ── Display Labels ───────────────────────────────────

export function timeSlotLabel(slot: string): string {
  switch (slot) {
    case "MORNING":
      return "Morning (8AM – 12PM)";
    case "AFTERNOON":
      return "Afternoon (12PM – 5PM)";
    case "EVENING":
      return "Evening (5PM – 8PM)";
    default:
      return slot;
  }
}

export function paymentLabel(method: string): string {
  switch (method) {
    case "COD":
      return "Cash on Delivery";
    case "EWALLET":
      return "E-wallet Transfer";
    case "MANUAL":
      return "Manual Arrangement";
    default:
      return method;
  }
}

// ── Address ───────────────────────────────────────────

export function formatCheckoutAddress(addr: {
  fullName?: string;
  recipientName?: string;
  phone?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zipCode?: string;
}): string {
  const parts = [
    addr.recipientName || addr.fullName,
    addr.street,
    addr.barangay,
    addr.city,
    addr.province,
    addr.zipCode,
  ].filter(Boolean);
  return parts.join(", ");
}