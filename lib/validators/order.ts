import { z } from "zod";
import { futureIsoDate } from "@/lib/validators/shared";

export const CreateOrderSchema = z.strictObject({
  addressId: z.string().min(1, "Address ID is required"),
  deliveryDate: futureIsoDate("Delivery date"),
  timeSlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  paymentMethod: z.enum(["COD", "EWALLET", "MANUAL"]),
  selectedItemIds: z.array(z.string().min(1)).min(1, "At least one item must be selected"),
});

export const UpdateOrderStatusSchema = z.strictObject({
  status: z.enum(["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
