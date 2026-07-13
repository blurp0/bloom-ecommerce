"use client";

import { useCallback, useState, useRef, type FormEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { OCCASIONS } from "@/lib/occasions-config";

/**
 * Sort options matching the API's sort parameter.
 */
const SORT_OPTIONS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Customer Rating" },
] as const;

/**
 * Occasion options.
 */
const OCCASION_OPTIONS = [
  { value: "", label: "All Occasions" },
  ...OCCASIONS.map((o) => ({ value: o.slug, label: o.label })),
];

type ProductFiltersProps = {
  categories: Array<{ slug: string; name: string }>;
};

/**
 * ProductFilters — sidebar / overlay filter panel for the product catalog.
 *
 * All filter state is read from and written to URL query parameters so the
 * view is shareable and back-button-safe. A "Clear Filters" button appears
 * only when at least one filter is active.
 *
 * Desktop: sticky sidebar (280px) on the left of the product grid.
 * Mobile (<1024px): overlay drawer opened by a "Filters" button.
 */
export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derived filter values from URL
  const currentCategory = searchParams.get("category") ?? "";
  const currentOccasion = searchParams.get("occasion") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  // Local state for controlled inputs
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State-based previous-value tracking to detect external URL changes
  // (back/forward navigation, clearFilters, etc.) without ref mutation during render.
  const [prevSearch, setPrevSearch] = useState(currentSearch);
  const [prevMin, setPrevMin] = useState(currentMinPrice);
  const [prevMax, setPrevMax] = useState(currentMaxPrice);

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch);
    if (searchValue !== currentSearch) setSearchValue(currentSearch);
  }
  if (prevMin !== currentMinPrice) {
    setPrevMin(currentMinPrice);
    if (minPrice !== currentMinPrice) setMinPrice(currentMinPrice);
  }
  if (prevMax !== currentMaxPrice) {
    setPrevMax(currentMaxPrice);
    if (maxPrice !== currentMaxPrice) setMaxPrice(currentMaxPrice);
  }

  /**
   * Updates the URL with the given params while preserving existing ones.
   */
  const updateUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change
      params.delete("page");
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  /**
   * Whether any filter is active.
   */
  const hasActiveFilters = Boolean(
    currentCategory || currentOccasion || currentMinPrice || currentMaxPrice || currentSort || currentSearch
  );

  /**
   * Clears all filters and resets the URL.
   */
  const clearFilters = useCallback(() => {
    setSearchValue("");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  /**
   * Handles debounced search input.
   */
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        updateUrl({ search: value || undefined });
      }, 300);
    },
    [updateUrl]
  );

  /**
   * Handles search form submit (immediate, no debounce).
   */
  const handleSearchSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      updateUrl({ search: searchValue || undefined });
    },
    [updateUrl, searchValue]
  );

  /**
   * Handles price blur — validates and updates URL.
   */
  const handlePriceBlur = useCallback(
    (field: "minPrice" | "maxPrice") => {
      const raw = field === "minPrice" ? minPrice : maxPrice;
      if (raw && isNaN(Number(raw))) return;
      // Clamp negative values to 0
      const clamped = raw ? String(Math.max(0, Number(raw))) : "";
      if (field === "minPrice") {
        if (clamped !== minPrice) setMinPrice(clamped);
      } else {
        if (clamped !== maxPrice) setMaxPrice(clamped);
      }
      const effectiveMin = field === "minPrice" ? clamped : minPrice;
      const effectiveMax = field === "maxPrice" ? clamped : maxPrice;
      const min = Number(effectiveMin || 0);
      const max = Number(effectiveMax || 0);
      if (effectiveMin && effectiveMax && min > max) {
        // Clamp: set the changed field to the other field's value
        if (field === "minPrice") {
          setMinPrice(effectiveMax);
          updateUrl({ minPrice: effectiveMax || undefined });
        } else {
          setMaxPrice(effectiveMin);
          updateUrl({ maxPrice: effectiveMin || undefined });
        }
        return;
      }
      updateUrl({ [field]: clamped || undefined });
    },
    [minPrice, maxPrice, updateUrl]
  );

  // Filter content shared between desktop sidebar and mobile overlay
  const filterContent = (
    <>
      {/* Search input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search bouquets..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-[12px] border border-[var(--border-interactive)] bg-surface py-2.5 pl-10 pr-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          aria-label="Search products"
        />
      </form>

      {/* Category filter */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-body font-semibold text-body text-text-primary">
          Category
        </legend>
        <div className="relative">
          <select
            value={currentCategory}
            onChange={(e) => updateUrl({ category: e.target.value || undefined })}
            className="filter-select w-full appearance-none rounded-[12px] border border-[var(--border-interactive)] bg-surface px-3 py-2.5 pr-8 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {/* Custom arrow so dropdown remains identifiable after appearance:none */}
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">▼</span>
        </div>
      </fieldset>

      {/* Occasion filter */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-body font-semibold text-body text-text-primary">
          Occasion
        </legend>
        <div className="relative">
          <select
            value={currentOccasion}
            onChange={(e) => updateUrl({ occasion: e.target.value || undefined })}
            className="filter-select w-full appearance-none rounded-[12px] border border-[var(--border-interactive)] bg-surface px-3 py-2.5 pr-8 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Filter by occasion"
          >
            {OCCASION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">▼</span>
        </div>
      </fieldset>

      {/* Price range */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-body font-semibold text-body text-text-primary">
          Price Range
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => handlePriceBlur("minPrice")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePriceBlur("minPrice");
            }}
            className="w-full rounded-[12px] border border-[var(--border-interactive)] bg-surface px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Minimum price"
            min={0}
          />
          <span className="text-text-muted" aria-hidden="true">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => handlePriceBlur("maxPrice")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePriceBlur("maxPrice");
            }}
            className="w-full rounded-[12px] border border-[var(--border-interactive)] bg-surface px-3 py-2.5 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Maximum price"
            min={0}
          />
        </div>
      </fieldset>

      {/* Sort order */}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-body font-semibold text-body text-text-primary">
          Sort By
        </legend>
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateUrl({ sort: e.target.value || undefined })}
            className="filter-select w-full appearance-none rounded-[12px] border border-[var(--border-interactive)] bg-surface px-3 py-2.5 pr-8 text-body text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">▼</span>
        </div>
      </fieldset>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="clay-button flex items-center justify-center gap-2 rounded-[12px] border border-[var(--border-interactive)] bg-surface px-4 py-2.5 text-body font-medium text-text-primary transition-colors duration-200 ease-out hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear Filters
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden w-[280px] shrink-0 flex-col gap-6 lg:flex"
        aria-label="Product filters"
      >
        <div className="sticky top-24 flex flex-col gap-6">
          {filterContent}
        </div>
      </aside>

      {/* Mobile filter toggle button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="clay-button flex items-center gap-2 rounded-[12px] border border-[var(--border-interactive)] bg-surface px-4 py-2.5 text-body font-medium text-text-primary transition-colors duration-200 ease-out hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-caption font-bold text-accent-primary-foreground">
              {[
                currentCategory,
                currentOccasion,
                currentMinPrice || currentMaxPrice ? "price" : "",
                currentSort,
                currentSearch,
              ].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto bg-bg-base p-6 shadow-lg animate-in slide-in-from-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-card-title text-text-primary">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-[12px] text-text-muted hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {filterContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}