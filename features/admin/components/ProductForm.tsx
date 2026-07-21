"use client";

import { useEffect, useState, useRef } from "react";
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
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isActive: z.boolean(),
  images: z
    .array(z.object({ url: z.string().min(1, "Image is required"), alt: z.string().optional() }))
    .min(1, "At least 1 image required"),
  variants: z.array(
    z.object({
      name: z.string().min(1, "Name required"),
      price: z.number(),
      color: z.string().optional(),
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

// ── Image Library Dialog ────────────────────────────────

interface ImageLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUrls: string[];
  onSelect: (urls: string[]) => void;
  maxSelectable: number;
}

function ImageLibraryDialog({
  open,
  onOpenChange,
  selectedUrls,
  onSelect,
  maxSelectable,
}: ImageLibraryDialogProps) {
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLocalSelected([]);
      fetchImages();
    }
  }, [open]);

  const fetchImages = async (cursor?: string) => {
    setLoading(true);
    try {
      const url = cursor
        ? `/api/admin/uploads/library?next_cursor=${encodeURIComponent(cursor)}`
        : "/api/admin/uploads/library";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const { data, next_cursor } = await res.json();
      if (cursor) {
        setImages((prev) => [...prev, ...data]);
      } else {
        setImages(data);
      }
      setNextCursor(next_cursor || null);
    } catch {
      toast.error("Failed to load image library");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (url: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(url)) return prev.filter((item) => item !== url);
      if (selectedUrls.length + prev.length >= maxSelectable) {
        toast.error(`Maximum ${maxSelectable} images total allowed`);
        return prev;
      }
      return [...prev, url];
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col rounded-[20px]">
        <DialogHeader>
          <DialogTitle>Select from Library</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-[300px] py-4">
          {images.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted">
              No images found in library
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((img) => {
                const isPicked = localSelected.includes(img.url);
                const isAlreadySelected = selectedUrls.includes(img.url);
                return (
                  <div
                    key={img.publicId}
                    onClick={() => !isAlreadySelected && handleToggleSelect(img.url)}
                    className={`relative cursor-pointer aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isAlreadySelected
                        ? "border-green-500 opacity-60 cursor-not-allowed"
                        : isPicked
                          ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20"
                          : "border-transparent hover:border-[var(--border-interactive)]"
                    }`}
                  >
                    <img src={img.url} alt="Library asset" className="w-full h-full object-cover" />
                    {isPicked && (
                      <div className="absolute top-1 right-1 bg-[var(--accent-primary)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        ✓
                      </div>
                    )}
                    {isAlreadySelected && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium">
                        Added
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          )}
          {nextCursor && !loading && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" size="sm" onClick={() => fetchImages(nextCursor)}>
                Load More
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-default)]">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSelect(localSelected);
              onOpenChange(false);
            }}
            disabled={localSelected.length === 0}
          >
            Select ({localSelected.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ──────────────────────────────────────

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
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const localFilesRef = useRef<Record<string, File>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      categoryIds: [],
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.keys(localFilesRef.current).forEach((url) => URL.revokeObjectURL(url));
      localFilesRef.current = {};
    };
  }, []);

  // Pre-fill when editing
  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        categoryIds: product.categories.map((c: { id: string }) => c.id),
        isActive: product.isActive,
        images: product.images.map((img: { url: string; alt: string | null }) => ({
          url: img.url,
          alt: img.alt ?? undefined,
        })),
        variants: product.variants.map((v: { name: string; price: number; color?: string | null; sku: string | null }) => ({
          name: v.name,
          price: v.price,
          color: v.color ?? undefined,
          sku: v.sku ?? undefined,
        })),
        addOns: product.addOns.map((a: { name: string; price: number }) => ({
          name: a.name,
          price: a.price,
        })),
        hasInventory: !!product.inventory,
        inventoryQuantity: product.inventory?.quantity ?? 0,
        inventoryUnit: product.inventory?.unit ?? "pieces",
        inventoryLowStock: product.inventory?.lowStock ?? 10,
      });
      localFilesRef.current = {};
    } else if (!isEdit && open) {
      Object.keys(localFilesRef.current).forEach((url) => URL.revokeObjectURL(url));
      localFilesRef.current = {};
      form.reset();
    }
  }, [isEdit, product, open, form]);

  // Image selection handler (stores locally, uploads on submit)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const currentCount = form.getValues("images").length;
    const remaining = 5 - currentCount;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const toAdd = Array.from(files).slice(0, remaining);
    toAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      const maxBytes = 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      localFilesRef.current[previewUrl] = file;
      imagesField.append({ url: previewUrl, alt: "" });
    });
    e.target.value = "";
  };

  // Image removal handler
  const handleRemoveImage = (index: number) => {
    const imgUrl = form.getValues(`images.${index}.url`);
    if (imgUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imgUrl);
      delete localFilesRef.current[imgUrl];
    }
    imagesField.remove(index);
  };

  // Submit
  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      // Upload pending local files to Cloudinary
      const uploadedImages = await Promise.all(
        values.images.map(async (img) => {
          if (img.url.startsWith("blob:")) {
            const file = localFilesRef.current[img.url];
            if (!file) throw new Error("Local file not found");

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/uploads/image?folder=products", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error ?? "Image upload failed");
            }

            const { url } = await res.json();
            URL.revokeObjectURL(img.url);
            delete localFilesRef.current[img.url];
            return { url, alt: img.alt };
          }
          return img;
        }),
      );

      const payload = {
        name: values.name,
        description: values.description,
        basePrice: values.basePrice,
        categoryIds: values.categoryIds,
        isActive: values.isActive,
        images: uploadedImages,
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

      if (isEdit && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Product updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || (isEdit ? "Failed to update product" : "Failed to create product"));
    } finally {
      setUploading(false);
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
              <Label>Categories</Label>
              {categoriesLoading ? (
                <div className="h-9 rounded-lg border border-[var(--border-default)] bg-bg-surface flex items-center px-2.5 text-text-muted text-sm">
                  Loading categories...
                </div>
              ) : !categories || categories.length === 0 ? (
                <div className="h-9 rounded-lg border border-[var(--border-default)] bg-bg-surface flex items-center px-2.5 text-text-muted text-sm">
                  No categories available
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1.5 p-3 rounded-lg border border-[var(--border-default)] bg-bg-surface max-h-40 overflow-y-auto">
                  {categories.map((cat) => {
                    const watchCategoryIds = form.watch("categoryIds") || [];
                    const isChecked = watchCategoryIds.includes(cat.id);
                    return (
                      <div key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`category-${cat.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("categoryIds") || [];
                            if (checked) {
                              form.setValue("categoryIds", [...current, cat.id], { shouldDirty: true });
                            } else {
                              form.setValue("categoryIds", current.filter((id) => id !== cat.id), { shouldDirty: true });
                            }
                          }}
                        />
                        <Label htmlFor={`category-${cat.id}`} className="cursor-pointer font-normal text-sm">
                          {cat.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
              {form.formState.errors.categoryIds && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.categoryIds.message}</p>
              )}
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
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-medium text-text-primary">
                Images ({imagesField.fields.length}/5)
              </h3>
              {imagesField.fields.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setIsLibraryOpen(true)}>
                  Select from Library
                </Button>
              )}
            </div>

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
                    onClick={() => handleRemoveImage(i)}
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
                onClick={() => variantsField.append({ name: "", price: 0, color: "", sku: "" })}
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
                  <Input placeholder="Color (opt)" {...form.register(`variants.${i}.color`)} />
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

        <ImageLibraryDialog
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          selectedUrls={form.watch("images").map((img) => img.url)}
          onSelect={(urls) => urls.forEach((url) => imagesField.append({ url, alt: "" }))}
          maxSelectable={5}
        />
      </DialogContent>
    </Dialog>
  );
}
