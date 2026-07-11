import { z } from "zod";

export const CreateOrderSchema = z.strictObject({
  addressId: z.string().min(1, "Address ID is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  timeSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  paymentMethod: z.enum(["COD", "EWALLET", "MANUAL"]),
  selectedItemIds: z.array(z.string().min(1)).min(1, "At least one item must be selected"),
});

export const UpdateOrderStatusSchema = z.strictObject({
  status: z.enum(["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
