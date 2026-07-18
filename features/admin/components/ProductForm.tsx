"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { OCCASIONS } from "@/lib/occasions-config";
import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
  useAdminCategories,
} from "@/features/admin/hooks/useAdminProducts";

// ── Form Schema (client-side, matches admin validators) ──

const FormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required"),
  basePrice: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  occasionTags: z.array(z.string()),
  isActive: z.boolean(),
  images: z
    .array(z.object({ url: z.string().url(), alt: z.string().optional() }))
    .min(1, "At least 1 image required"),
  variants: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      price: z.number(),
      sku: z.string().optional(),
    }),
  ),
  addOns: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      price: z.number().min(0, "Must be ≥ 0"),
    }),
  ),
  hasInventory: z.boolean(),
  inventoryQuantity: z.number().int().min(0).optional(),
  inventoryUnit: z.string().optional(),
  inventoryLowStock: z.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

// ── Component ─────────────────────────────────────────

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
}

export function ProductForm({ open, onOpenChange, editingId }: ProductFormProps) {
  const isEdit = !!editingId;
  const { data: product } = useAdminProduct(editingId);
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
      occasionTags: [],
      isActive: true,
      images: [],
      variants: [],
      addOns: [],
      hasInventory: false,
      inventoryQuantity: 0,
      inventoryUnit: "pieces",
      inventoryLowStock: 10,
    },
  });

  const imagesField = useFieldArray({ control: form.control, name: "images" });
  const variantsField = useFieldArray({ control: form.control, name: "variants" });
  const addOnsField = useFieldArray({ control: form.control, name: "addOns" });

  // Pre-fill when editing
  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        categoryId: product.categoryId ?? "",
        occasionTags: product.occasionTags,
        isActive: product.isActive,
        images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? undefined })),
        variants: product.variants.map((v) => ({ name: v.name, price: v.price, sku: v.sku ?? undefined })),
        addOns: product.addOns.map((a) => ({ name: a.name, price: a.price })),
        hasInventory: !!product.inventory,
        inventoryQuantity: product.inventory?.quantity ?? 0,
        inventoryUnit: product.inventory?.unit ?? "pieces",
        inventoryLowStock: product.inventory?.lowStock ?? 10,
      });
    } else if (!isEdit && open) {
      form.reset();
    }
  }, [isEdit, product, open, form]);

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const currentCount = form.getValues("images").length;
    const remaining = 5 - currentCount;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/uploads/image?folder=products", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error ?? "Upload failed");
          continue;
        }

        const { url } = await res.json();
        imagesField.append({ url, alt: "" });
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Occasion tag toggle
  const watchOccasions = form.watch("occasionTags");
  const toggleOccasion = (slug: string) => {
    const current = form.getValues("occasionTags");
    if (current.includes(slug)) {
      form.setValue("occasionTags", current.filter((t) => t !== slug), { shouldDirty: true });
    } else {
      form.setValue("occasionTags", [...current, slug], { shouldDirty: true });
    }
  };

  // Submit
  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      categoryId: values.categoryId,
      occasionTags: values.occasionTags,
      isActive: values.isActive,
      images: values.images,
      variants: values.variants,
      addOns: values.addOns,
      inventory: values.hasInventory
        ? {
            quantity: values.inventoryQuantity ?? 0,
            unit: values.inventoryUnit ?? "pieces",
            lowStock: values.inventoryLowStock ?? 10,
          }
        : undefined,
    };

    try {
      if (isEdit && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Product updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? "Failed to update product" : "Failed to create product");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const hasInventory = form.watch("hasInventory");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <section className="space-y-3">
            <h3 className="font-heading text-base font-medium text-text-primary">Basic Info</h3>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              {categoriesLoading ? (
                <div className="h-9 rounded-lg border border-[var(--border-default)] bg-bg-surface flex items-center px-2.5 text-text-muted text-sm">
                  Loading categories...
                </div>
              ) : !categories || categories.length === 0 ? (
                <div className="h-9 rounded-lg border border-[var(--border-default)] bg-bg-surface flex items-center px-2.5 text-text-muted text-sm">
                  No categories available
                </div>
              ) : (
                <select
                  id="categoryId"
                  {...form.register("categoryId")}
                  className="w-full h-9 rounded-lg border border-[var(--border-default)] bg-bg-surface px-2.5 text-sm text-text-primary outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-colors"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <Label>Occasions</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.slug}
                    type="button"
                    onClick={() => toggleOccasion(occ.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors duration-150 cursor-pointer ${
                      watchOccasions.includes(occ.slug)
                        ? "bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]"
                        : "bg-bg-surface text-text-muted border-[var(--border-default)] hover:border-[var(--border-interactive)]"
                    }`}
                  >
                    {occ.emoji} {occ.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="space-y-3">
            <h3 className="font-heading text-base font-medium text-text-primary">Pricing</h3>
            <div>
              <Label htmlFor="basePrice">Base Price (₱)</Label>
              <Input id="basePrice" type="number" step="0.01" {...form.register("basePrice", { valueAsNumber: true })} />
              {form.formState.errors.basePrice && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.basePrice.message}</p>
              )}
            </div>
          </section>

          {/* Images */}
          <section className="space-y-3">
            <h3 className="font-heading text-base font-medium text-text-primary">
              Images ({imagesField.fields.length}/5)
            </h3>

            <div className="flex flex-wrap gap-3">
              {imagesField.fields.map((field, i) => (
                <div key={field.id} className="relative group">
                  <img
                    src={field.url}
                    alt={field.alt || `Product image ${i + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => imagesField.remove(i)}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {imagesField.fields.length < 5 && (
                <label className="h-20 w-20 rounded-lg border-2 border-dashed border-[var(--border-interactive)] flex flex-col items-center justify-center cursor-pointer hover:bg-bg-elevated transition-colors duration-150">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-text-muted" />
                      <span className="text-[10px] text-text-muted mt-0.5">Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {form.formState.errors.images && (
              <p className="text-sm text-red-500">{form.formState.errors.images.message}</p>
            )}
          </section>

          {/* Variants */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-medium text-text-primary">Variants</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => variantsField.append({ name: "", price: 0, sku: "" })}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>

            {variantsField.fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input placeholder="Name (e.g. Small)" {...form.register(`variants.${i}.name`)} />
                </div>
                <div className="w-28">
                  <Input placeholder="±Price" type="number" step="0.01" {...form.register(`variants.${i}.price`, { valueAsNumber: true })} />
                </div>
                <div className="w-24">
                  <Input placeholder="SKU" {...form.register(`variants.${i}.sku`)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => variantsField.remove(i)}
                  aria-label="Remove variant"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </section>

          {/* Add-ons */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-medium text-text-primary">Add-ons</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOnsField.append({ name: "", price: 0 })}
              >
                <Plus className="mr-1 h-3 w-3" /> Add
              </Button>
            </div>

            {addOnsField.fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input placeholder="Name" {...form.register(`addOns.${i}.name`)} />
                </div>
                <div className="w-28">
                  <Input placeholder="Price" type="number" step="0.01" min="0" {...form.register(`addOns.${i}.price`, { valueAsNumber: true })} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => addOnsField.remove(i)}
                  aria-label="Remove add-on"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </section>

          {/* Inventory */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hasInventory"
                checked={hasInventory}
                onCheckedChange={(v) => form.setValue("hasInventory", !!v)}
              />
              <Label htmlFor="hasInventory" className="cursor-pointer">
                Track Inventory
              </Label>
            </div>

            {hasInventory && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="inventoryQuantity">Quantity</Label>
                  <Input id="inventoryQuantity" type="number" min="0" {...form.register("inventoryQuantity", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="inventoryUnit">Unit</Label>
                  <Input id="inventoryUnit" {...form.register("inventoryUnit")} />
                </div>
                <div>
                  <Label htmlFor="inventoryLowStock">Low Stock Alert</Label>
                  <Input id="inventoryLowStock" type="number" min="0" {...form.register("inventoryLowStock", { valueAsNumber: true })} />
                </div>
              </div>
            )}
          </section>

          {/* Status */}
          <section className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={form.watch("isActive")}
              onCheckedChange={(v) => form.setValue("isActive", !!v)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active (visible to customers)
            </Label>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || uploading}>
              {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
