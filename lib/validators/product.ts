import { z } from "zod";

export const CreateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().positive("Base price must be a positive number"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isActive: z.boolean().default(true),
});

export const UpdateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  basePrice: z.number().positive("Base price must be a positive number").optional(),
  categoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const ProductQuerySchema = z.strictObject({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
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

// ── Admin Schemas ─────────────────────────────────────

export const AdminProductQuerySchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z
    .enum([
      "name_asc",
      "name_desc",
      "price_asc",
      "price_desc",
      "stock_asc",
      "stock_desc",
      "newest",
    ])
    .default("newest"),
  search: z.string().min(1).max(100).optional(),
});

const ImageItemSchema = z.strictObject({
  url: z.string().min(1, "Image is required"),
  alt: z.string().max(200).optional(),
});

const VariantItemSchema = z.strictObject({
  name: z.string().min(1, "Variant name is required"),
  price: z.coerce.number({ error: "Variant price is required" }),
  color: z.string().optional(),
  sku: z.string().optional(),
});

const AddOnItemSchema = z.strictObject({
  name: z.string().min(1, "Add-on name is required"),
  price: z.coerce.number().min(0, "Add-on price must be ≥ ₱0"),
});

const InventoryItemSchema = z.strictObject({
  quantity: z.coerce.number().int().min(0).default(0),
  unit: z.string().min(1).default("pieces"),
  lowStock: z.coerce.number().int().min(0).default(10),
});

export const AdminCreateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  basePrice: z.coerce.number().positive("Base price must be positive"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isActive: z.boolean().default(true),
  images: z.array(ImageItemSchema).min(1, "At least 1 image is required"),
  variants: z.array(VariantItemSchema).default([]),
  addOns: z.array(AddOnItemSchema).default([]),
  inventory: InventoryItemSchema.optional(),
});

export const AdminUpdateProductSchema = z.strictObject({
  name: z.string().min(1, "Name is required").max(200).optional(),
  description: z.string().min(1, "Description is required").optional(),
  basePrice: z.coerce.number().positive("Base price must be positive").optional(),
  categoryIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  images: z.array(ImageItemSchema).min(1, "At least 1 image is required").optional(),
  variants: z.array(VariantItemSchema).optional(),
  addOns: z.array(AddOnItemSchema).optional(),
  inventory: InventoryItemSchema.optional().nullable(),
});

export const ToggleStatusSchema = z.strictObject({
  isActive: z.boolean(),
});

export const BulkDeleteSchema = z.strictObject({
  ids: z.array(z.string()).min(1, "Select at least one product"),
});

export type AdminProductQuery = z.infer<typeof AdminProductQuerySchema>;
export type AdminCreateProductInput = z.infer<typeof AdminCreateProductSchema>;
export type AdminUpdateProductInput = z.infer<typeof AdminUpdateProductSchema>;