import { z } from "zod";

export const AddressSchema = z.strictObject({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  zip: z.string().regex(/^\d{4}$/, "Zip code must be a 4-digit PH format"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof AddressSchema>;
