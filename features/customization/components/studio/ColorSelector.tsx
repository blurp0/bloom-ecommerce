"use client";

import { useCustomizationStore } from "@/features/customization/store";
import type { VariantData } from "@/features/customization/types";

interface ColorSelectorProps {
  variants: VariantData[];
}

/**
 * ColorSelector — renders a row of color pill buttons for bouquet color selection.
 * Filters unique colors from variants and syncs selection to Zustand store.
 */
export default function ColorSelector({ variants }: ColorSelectorProps) {
  const selectedColor = useCustomizationStore((s) => s.selectedColor);
  const setColor = useCustomizationStore((s) => s.setColor);

  const uniqueColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean)),
  ) as string[];

  if (uniqueColors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueColors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => setColor(color)}
          aria-pressed={selectedColor === color}
          className={[
            "px-4 py-2 rounded-[9999px] text-sm font-medium border transition-all duration-150 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]",
            selectedColor === color
              ? "bg-[var(--accent-primary)] text-[var(--accent-primary-foreground)] border-[var(--accent-primary)]"
              : "bg-transparent text-[var(--text-primary)] border-[var(--border-interactive)] hover:border-[var(--accent-primary)]",
          ].join(" ")}
        >
          {color}
        </button>
      ))}
    </div>
  );
}
