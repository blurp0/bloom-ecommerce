import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";
import { CustomizationStudio, StudioProductData } from "@/features/customization/components";

interface CustomizationPageParams {
  params: Promise<{ productId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

const customizationInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: { order: "asc" as const }, select: { url: true, alt: true } },
  variants: { orderBy: { price: "asc" as const } },
  addOns: true,
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof customizationInclude;
}>;

/** CUID format: lowercase alphanumeric, 25 chars typical */
const VALID_ID = /^[a-z0-9]{20,30}$/;

/**
 * React.cache() ensures generateMetadata and the page share
 * a single Prisma call per request.
 */
const fetchProduct = cache(
  async (id: string): Promise<ProductWithRelations | null> => {
    if (!VALID_ID.test(id)) return null;
    return prisma.product.findFirst({
      where: { id, isActive: true },
      include: customizationInclude,
    });
  }
);

function toStudioData(product: ProductWithRelations): StudioProductData {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    basePrice: Number(product.basePrice),
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
    })),
    addOns: product.addOns.map((a) => ({
      id: a.id,
      name: a.name,
      price: Number(a.price),
      image: a.image,
      slug: /message\s*card|greeting\s*card/i.test(a.name)
        ? "message-card"
        : undefined,
      type: /message\s*card|greeting\s*card/i.test(a.name)
        ? "message-card"
        : undefined,
      isMessageCard: /message\s*card|greeting\s*card/i.test(a.name),
    })),
    categoryName: product.category?.name,
    categorySlug: product.category?.slug,
  };
}

export async function generateMetadata({
  params,
}: CustomizationPageParams): Promise<Metadata> {
  const { productId } = await params;
  const raw = await fetchProduct(productId);

  if (!raw) {
    return { title: "Product Not Found | Bloom & Bind" };
  }

  return {
    title: `Customize ${raw.name} | Bloom & Bind`,
    description: `Customize your ${raw.name} bouquet — choose size, add-ons, and a personal message.`,
  };
}

/**
 * Customization Studio Page
 *
 * Server component: fetches product data by ID, renders breadcrumbs,
 * and delegates the interactive customization UI to CustomizationStudio.
 *
 * Returns 404 for missing or inactive products.
 */
export default async function CustomizationPage({
  params,
  searchParams,
}: CustomizationPageParams) {
  const { productId } = await params;
  const raw = await fetchProduct(productId);

  if (!raw) notFound();

  const resolvedSearchParams = await searchParams;
  const initialVariantId =
    typeof resolvedSearchParams?.variantId === "string"
      ? resolvedSearchParams.variantId
      : null;
  const initialVariantName =
    typeof resolvedSearchParams?.variantName === "string"
      ? resolvedSearchParams.variantName
      : null;

  const product = toStudioData(raw);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm font-body flex-wrap">
          <li>
            <Link
              href="/"
              className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors duration-150"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </li>
          {product.categorySlug && product.categoryName && (
            <>
              <li>
                <Link
                  href={`/products?category=${product.categorySlug}`}
                  className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors duration-150"
                >
                  {product.categoryName}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </li>
            </>
          )}
          <li>
            <Link
              href={`/products/${raw.slug}`}
              className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] transition-colors duration-150"
            >
              {product.name}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          </li>
          <li
            className="text-[var(--text-muted)] truncate max-w-[200px]"
            aria-current="page"
          >
            Customize
          </li>
        </ol>
      </nav>

      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-[2rem] leading-tight text-[var(--text-primary)]">
          Customize Your Bouquet
        </h1>
        <p className="text-base text-[var(--text-muted)]">
          Personalize your {product.name} to make it uniquely yours.
        </p>
      </div>

      {/* Customization Studio */}
      <CustomizationStudio
        key={product.id}
        product={product}
        initialVariantId={initialVariantId ?? null}
        initialVariantName={initialVariantName}
      />
    </div>
  );
}