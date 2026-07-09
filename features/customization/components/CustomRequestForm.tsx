"use client";

import { useMemo, useState } from "react";
import { CreateCustomRequestSchema } from "@/lib/validators/custom-request";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type FieldKey =
  | "flowers"
  | "colors"
  | "size"
  | "occasion"
  | "budget"
  | "instructions"
  | "referenceImages";

const OCCASION_OPTIONS = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Sympathy",
  "Graduation",
  "Corporate",
  "Get Well",
  "Other",
] as const;

const SIZE_OPTIONS = ["Small", "Medium", "Large", "Extra Large"] as const;

const BUDGET_OPTIONS = [
  "Under ₱500",
  "₱500–₱1,000",
  "₱1,000–₱2,500",
  "₱2,500–₱5,000",
  "₱5,000+",
] as const;

type UploadState = {
  status: "empty" | "ready" | "uploading" | "failed" | "uploaded";
  error?: string;
  file?: File;
  previewUrl?: string; // object URL
  url?: string; // cloudinary URL after upload
};

function getImageError(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Reference image must be an image file";
  const mb = file.size / (1024 * 1024);
  if (mb > 5) return "Each image must be 5MB or less";
  return null;
}

async function uploadToCloudinary(file: File): Promise<string> {
  const res = await fetch("/api/uploads/image?folder=custom-requests", {
    method: "POST",
    body: (() => {
      const fd = new FormData();
      fd.append("file", file);
      return fd;
    })(),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error || "Cloudinary image upload failed");
  }

  const json = (await res.json()) as { url?: string };
  if (!json?.url) throw new Error("Cloudinary returned no image URL");
  return json.url;
}

function revokeObjectUrl(url?: string) {
  if (!url) return;
  if (!url.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

// compat alias used by submit reset
function clearPreviewUrl(url?: string) {
  revokeObjectUrl(url);
}

export function CustomRequestForm() {
  const schema = useMemo(() => CreateCustomRequestSchema, []);

  const [values, setValues] = useState<{
    flowers: string;
    colors: string;
    size: string;
    occasion?: string;
    budget?: string;
    instructions?: string;
    referenceImages: string[]; // only populated on submit after uploading
  }>({
    flowers: "",
    colors: "",
    size: "",
    occasion: undefined,
    budget: undefined,
    instructions: "",
    referenceImages: [],
  });

  const [uploadStates, setUploadStates] = useState<UploadState[]>([
    { status: "empty" },
    { status: "empty" },
    { status: "empty" },
  ]);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnyUploading = uploadStates.some((s) => s.status === "uploading");

  function setField<K extends FieldKey>(
    key: K,
    value: (typeof values)[Extract<K, keyof typeof values>]
  ) {
    setValues((prev) => ({ ...prev, [key]: value } as any));
  }

  function validateOnBlur(key: FieldKey) {
    const candidate = {
      ...values,
      instructions: values.instructions?.trim() ? values.instructions : undefined,
      occasion: values.occasion ? values.occasion : undefined,
      budget: values.budget ? values.budget : undefined,
      referenceImages: values.referenceImages ?? [],
    };

    const result = schema.safeParse(candidate);
    if (result.success) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const issue = result.error.issues.find((i) => String(i.path[0]) === key);
    if (issue) {
      setFieldErrors((prev) => ({ ...prev, [key]: issue.message }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function clearImageSlot(slotIndex: number) {
    setUploadStates((prev) => {
      const next = [...prev];
      revokeObjectUrl(next[slotIndex]?.previewUrl);
      next[slotIndex] = { status: "empty" };
      return next;
    });

    // Since we defer cloudinary uploads until submit, referenceImages should be empty.
    setValues((prev) => ({ ...prev, referenceImages: [] }));
    setFieldErrors((prev) => ({ ...prev, referenceImages: undefined }));
  }

  function handleImagesSelected(files: FileList | null) {
    setSubmitError(null);

    if (!files || files.length === 0) return;

    const incoming = Array.from(files).slice(0, 3);

    // Validate file types and sizes first (fast fail)
    const validationErrors: string[] = [];
    for (const f of incoming) {
      const err = getImageError(f);
      if (err) validationErrors.push(err);
    }
    if (validationErrors.length) {
      setFieldErrors((prev) => ({ ...prev, referenceImages: validationErrors[0] }));
      return;
    }

    const emptySlots = uploadStates
      .map((s, idx) => ({ s, idx }))
      .filter(({ s }) => s.status === "empty" || s.status === "failed")
      .slice(0, incoming.length)
      .map(({ idx }) => idx);

    if (emptySlots.length === 0) {
      setFieldErrors((prev) => ({
        ...prev,
        referenceImages: "All 3 image slots are already filled.",
      }));
      return;
    }

    // Only store files + previews (no cloudinary calls here).
    setUploadStates((prev) => {
      const next = [...prev];
      for (let j = 0; j < emptySlots.length; j++) {
        const slotIndex = emptySlots[j];
        const file = incoming[j];

        revokeObjectUrl(next[slotIndex]?.previewUrl);

        next[slotIndex] = {
          status: "ready",
          file,
          previewUrl: URL.createObjectURL(file),
          error: undefined,
          url: undefined,
        };
      }
      return next;
    });

    setValues((prev) => ({ ...prev, referenceImages: [] }));
    setFieldErrors((prev) => ({ ...prev, referenceImages: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (isAnyUploading) return;

    const hasFailed = uploadStates.some((s) => s.status === "failed");
    if (hasFailed) {
      setSubmitError("Please fix image upload errors before submitting.");
      return;
    }

    const filesToUpload = uploadStates
      .map((s) => (s.status === "ready" && s.file ? s.file : null))
      .filter((f): f is File => Boolean(f));

    setIsSubmitting(true);
    try {
      setUploadStates((prev) =>
        prev.map((s) => (s.status === "ready" ? { ...s, status: "uploading" } : s))
      );

      const referenceImages: string[] = [];
      const files = filesToUpload;

      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        referenceImages.push(url);
      }

      const candidate = {
        flowers: values.flowers,
        colors: values.colors,
        size: values.size,
        occasion: values.occasion ? values.occasion : undefined,
        budget: values.budget ? values.budget : undefined,
        instructions: values.instructions?.trim() ? values.instructions : undefined,
        referenceImages,
      };

      const result = schema.safeParse(candidate);
      if (!result.success) {
        const mapped: Partial<Record<FieldKey, string>> = {};
        for (const issue of result.error.issues) {
          const key = String(issue.path[0]) as FieldKey;
          if (!mapped[key]) mapped[key] = issue.message;
        }
        setFieldErrors(mapped);
        return;
      }

      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const msg = json?.error || "Failed to submit request";
        setSubmitError(msg);
        return;
      }

      setValues({
        flowers: "",
        colors: "",
        size: "",
        occasion: undefined,
        budget: undefined,
        instructions: "",
        referenceImages: [],
      });
      setUploadStates((prev) => {
        prev.forEach((s) => revokeObjectUrl(s.previewUrl));
        return [{ status: "empty" }, { status: "empty" }, { status: "empty" }];
      });
      setFieldErrors({});
    } finally {
      setIsSubmitting(false);
    }
  }

  const referenceImagesError =
    fieldErrors.referenceImages ||
    uploadStates.find((s) => s.status === "failed")?.error;

  return (
    <Card className="border-interactive/60 p-6">
      <h1 className="mb-2 text-2xl font-semibold">Custom Request</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Share your preferences—then upload reference images (optional) and submit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="flowers">Flower preferences *</Label>
          <Input
            id="flowers"
            value={values.flowers}
            onChange={(e) => setField("flowers", e.target.value)}
            onBlur={() => validateOnBlur("flowers")}
            placeholder="e.g., roses, lilies, peonies..."
          />
          {fieldErrors.flowers && (
            <p className="text-sm text-destructive">{fieldErrors.flowers}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="colors">Colors *</Label>
          <Input
            id="colors"
            value={values.colors}
            onChange={(e) => setField("colors", e.target.value)}
            onBlur={() => validateOnBlur("colors")}
            placeholder="e.g., blush pink, ivory, sage..."
          />
          {fieldErrors.colors && (
            <p className="text-sm text-destructive">{fieldErrors.colors}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Size *</Label>
          <Select
            value={values.size}
            onValueChange={(v) => {
              if (!v) return;
              setField("size", v as string);
              setTimeout(() => validateOnBlur("size"), 0);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.size && <p className="text-sm text-destructive">{fieldErrors.size}</p>}
          <div className="hidden" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Occasion</Label>
            <Select
              value={values.occasion ?? ""}
              onValueChange={(v) => {
                if (!v) return;
                setField("occasion", v as string);
                setTimeout(() => validateOnBlur("occasion"), 0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occasion (optional)" />
              </SelectTrigger>
              <SelectContent>
                {OCCASION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.occasion && (
              <p className="text-sm text-destructive">{fieldErrors.occasion}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Budget range</Label>
            <Select
              value={values.budget ?? ""}
              onValueChange={(v) => {
                if (!v) return;
                setField("budget", v as string);
                setTimeout(() => validateOnBlur("budget"), 0);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select budget (optional)" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.budget && (
              <p className="text-sm text-destructive">{fieldErrors.budget}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceImages">Reference images (optional, up to 3 — each ≤ 5MB)</Label>
          <Input
            id="referenceImages"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImagesSelected(e.target.files)}
            disabled={isAnyUploading || isSubmitting}
          />
          {referenceImagesError && (
            <p className="text-sm text-destructive">{referenceImagesError}</p>
          )}

          <div className="mt-2 grid grid-cols-3 gap-2">
            {uploadStates.map((s, idx) => {
              const showPreview = s.status !== "empty" && (s.previewUrl || s.url);
              const imgSrc = s.previewUrl ?? s.url;
              return (
                <div key={idx} className="rounded-md border p-2 text-xs">
                  {s.status === "empty" && <span className="text-muted-foreground">Empty</span>}
                  {s.status === "uploading" && <span>Uploading...</span>}

                  {(s.status === "ready" || s.status === "uploaded" || showPreview) && (
                    <div className="space-y-1">
                      <span className="text-success">Uploaded</span>
                      {imgSrc && (
                        <div className="relative h-64 w-full overflow-hidden rounded bg-muted">
                          <img
                            src={imgSrc}
                            alt={`Uploaded reference ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => clearImageSlot(idx)}
                            className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                            aria-label={`Remove image ${idx + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {s.status === "failed" && (
                    <div className="space-y-1">
                      <span className="text-destructive">
                        Failed{s.error ? `: ${s.error}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => clearImageSlot(idx)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Special instructions (optional, max 1000 chars)</Label>
          <Textarea
            id="instructions"
            value={values.instructions ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, instructions: e.target.value }))}
            onBlur={() => validateOnBlur("instructions")}
            placeholder="Any notes for your bouquet..."
            rows={4}
          />
          {fieldErrors.instructions && (
            <p className="text-sm text-destructive">{fieldErrors.instructions}</p>
          )}
        </div>

        {submitError && <p className="text-sm font-medium text-destructive">{submitError}</p>}

        <Button type="submit" disabled={isAnyUploading || isSubmitting} className="w-full">
          {isAnyUploading ? "Uploading images..." : isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </Card>
  );
}
