import { z } from "zod";

export const CreateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().positive("Base price must be a positive number"),
  categoryId: z.string().min(1, "Category ID is required"),
  isActive: z.boolean().default(true),
});

export const UpdateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  basePrice: z.number().positive("Base price must be a positive number").optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
