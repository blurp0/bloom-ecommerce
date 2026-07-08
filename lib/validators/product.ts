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

export const ProductQuerySchema = z.strictObject({
  category: z.string().optional(),
  occasion: z.string().optional(),
  minPrice: z.coerce.number().min(0, "minPrice must be >= 0").optional(),
  maxPrice: z.coerce.number().min(0, "maxPrice must be >= 0").optional(),
  search: z.string().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(["price_asc", "price_desc", "rating_desc", "newest"]).default("newest"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;