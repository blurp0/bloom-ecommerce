import { z } from "zod";
import { AddressSchema } from "./address";

export const CreateOrderSchema = z.strictObject({
  deliveryAddress: z.string().min(1, "Delivery address ID is required").optional(),
  newAddress: AddressSchema.optional(),
  deliveryDate: z.string().datetime({ message: "Invalid ISO date string" }).refine((val) => {
    return new Date(val) > new Date();
  }, { message: "Delivery date must be in the future" }),
  deliverySlot: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  paymentMethod: z.enum(["COD", "EWALLET", "MANUAL"]),
}).refine((data) => {
  return (data.deliveryAddress && !data.newAddress) || (!data.deliveryAddress && data.newAddress);
}, {
  message: "Must provide either an existing deliveryAddress ID or a newAddress inline object, but not both.",
  path: ["deliveryAddress"],
});

export const UpdateOrderStatusSchema = z.strictObject({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
