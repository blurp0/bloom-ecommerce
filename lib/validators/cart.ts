import { z } from "zod";

export const AddToCartSchema = z.strictObject({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
  customization: z
    .object({
      size: z.string().optional(),
      color: z.string().optional(),
      addOns: z.array(z.string()).optional(),
      messageCard: z.string().max(200, "Message card cannot exceed 200 characters").optional(),
    })
    .optional(),
  customRequestId: z.string().optional(),
});

export const UpdateCartItemSchema = z.strictObject({
  quantity: z.number().int("Quantity must be an integer").min(1, "Quantity must be at least 1").max(99, "Quantity cannot exceed 99"),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;