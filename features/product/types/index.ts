/**
 * Product feature types
 * Shared across product components, hooks, and utilities
 */

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  averageRating: number | null;
  reviewCount: number;
  images: ProductImage[];
}

export interface ProductDetail extends ProductCardProduct {
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Additional details not in card
  fullDescription?: string;
}

export interface ProductFilterParams {
  category?: string;
  occasion?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "price_asc" | "price_desc" | "rating_desc" | "newest";
}

export interface ProductPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: ProductCardProduct[];
  pagination: ProductPagination | null;
}
