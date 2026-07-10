import { z } from "zod/v4";

/**
 * Address schema for inline new-address objects (used by order creation).
 * Same shape as CreateAddressSchema but exported under the original name
 * for backward compatibility with lib/validators/order.ts.
 */
export const AddressSchema = z.strictObject({
  recipientName: z
    .string({ message: "Recipient name is required" })
    .min(1, "Recipient name is required"),
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
 * Schema for creating a new address.
 */
export const CreateAddressSchema = z.strictObject({
  label: z
    .string({ message: "Label must be text" })
    .max(40, "Label must be 40 characters or less")
    .optional(),
  recipientName: z
    .string({ message: "Recipient name is required" })
    .min(1, "Recipient name is required"),
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

export type CreateAddressData = z.infer<typeof CreateAddressSchema>;

/**
 * Schema for updating an existing address — all fields optional.
 */
export const UpdateAddressSchema = z.strictObject({
  label: z
    .string({ message: "Label must be text" })
    .max(40, "Label must be 40 characters or less")
    .optional(),
  recipientName: z.string().optional(),
  phone: z
    .string()
    .regex(/^(09|\+639)\d{9}$/, "Enter a valid PH phone number (e.g. 09171234567)")
    .optional(),
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zipCode: z
    .string()
    .regex(/^\d{4}$/, "ZIP code must be 4 digits")
    .optional(),
});

export type UpdateAddressData = z.infer<typeof UpdateAddressSchema>;

/**
 * Shape returned by the address API.
 */
export interface AddressResponse {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  zipCode: string;
  isDefault: boolean;
}