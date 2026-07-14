// ── Customization store types ──

export interface CustomizationState {
  productId: string | null;
  selectedVariantId: string | null;
  selectedAddOnIds: string[];
  messageCardText: string;
  quantity: number;
}

export interface VariantInput {
  id: string;
  priceAdjustment: number;
}

export interface AddOnInput {
  id: string;
  price: number;
}

export interface CustomizationActions {
  setProduct: (productId: string) => void;
  setVariant: (variantId: string | null) => void;
  toggleAddOn: (addOnId: string) => void;
  setMessageCardText: (text: string) => void;
  setQuantity: (n: number) => void;
  reset: () => void;
}

export type CustomizationStore = CustomizationState & CustomizationActions;

// ── Studio data types ──

export interface VariantData {
  id: string;
  name: string;
  price: number;
  color?: string;
}

export interface AddOnData {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  slug?: string | null;
  type?: string | null;
  isMessageCard?: boolean | null;
}

export interface ProductImageData {
  url: string;
  alt?: string | null;
}

export interface StudioProductData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: ProductImageData[];
  variants: VariantData[];
  addOns: AddOnData[];
  categoryName?: string;
  categorySlug?: string;
}

// ── Component prop types ──

export interface SizeSelectorProps {
  variants: VariantData[];
  basePrice: number;
}

export interface AddOnToggleCardsProps {
  addOns: AddOnData[];
}

export interface CustomizationStudioProps {
  product: StudioProductData;
  initialVariantId?: string | null;
  initialVariantName?: string | null;
}

export interface CustomizationSummaryProps {
  productId: string;
  productName: string;
  basePrice: number;
  variants: VariantData[];
  addOns: AddOnData[];
  images: ProductImageData[];
  hasVariants: boolean;
}

// ── Proposal / Custom Request types ──

export type ProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProposalViewProps {
  proposalId: string;
  customRequestId: string;
  designConcept: string;
  price: number | string;
  estimatedDelivery: string | Date;
  status: ProposalStatus;
}

export type FieldKey =
  | "flowers"
  | "colors"
  | "size"
  | "occasion"
  | "budget"
  | "instructions"
  | "referenceImages";

export interface UploadState {
  status: "empty" | "ready" | "uploading" | "failed" | "uploaded";
  error?: string;
  file?: File;
  previewUrl?: string;
  url?: string;
}