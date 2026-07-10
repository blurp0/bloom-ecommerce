import { z } from "zod/v4";

/**
 * Philippine address schema for checkout delivery.
 */
export const AddressSchema = z.strictObject({
  fullName: z
    .string({ message: "Full name is required" })
    .min(1, "Full name is required"),
  phone: z
    .string({ message: "Phone number is required" })
    .min(1, "Phone number is required")
    .regex(/^(09|\+639)\d{9}$/, "Enter a valid PH phone number (e.g. 09171234567)"),
  street: z
    .string({ message: "Street address is required" })
    .min(1, "Street address is required"),
  barangay: z
    .string({ message: "Barangay is required" })
    .min(1, "Barangay is required"),
  city: z
    .string({ message: "City is required" })
    .min(1, "City is required"),
  province: z
    .string({ message: "Province is required" })
    .min(1, "Province is required"),
  zipCode: z
    .string({ message: "ZIP code is required" })
    .min(1, "ZIP code is required")
    .regex(/^\d{4}$/, "ZIP code must be 4 digits"),
});

export type AddressData = z.infer<typeof AddressSchema>;

/**
 * Delivery schedule schema.
 */
export const DeliverySchema = z.strictObject({
  deliveryDate: z
    .string({ message: "Delivery date is required" })
    .min(1, "Delivery date is required"),
  timeSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"], {
    message: "Please select a time slot",
  }),
});

export type DeliveryData = z.infer<typeof DeliverySchema>;

/**
 * Payment method schema.
 */
export const PaymentSchema = z.strictObject({
  paymentMethod: z.enum(["COD", "EWALLET", "MANUAL"], {
    message: "Please select a payment method",
  }),
});

export type PaymentData = z.infer<typeof PaymentSchema>;