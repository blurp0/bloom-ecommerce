export interface CartItemResult {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  customization: Record<string, unknown>;
  itemTotal: number;
}

export interface CartResult {
  id: string;
  items: CartItemResult[];
  subtotal: number;
  itemCount: number;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  customization?: {
    size?: string;
    color?: string;
    addOns?: string[];
    messageCard?: string;
  };
  customRequestId?: string;
}
