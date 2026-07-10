import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";

function toItemTotal(price: { toNumber: () => number } | number, quantity: number): number {
  const p = typeof price === "number" ? price : price.toNumber();
  return Math.round((p * quantity + Number.EPSILON) * 100) / 100;
}

/**
 * Cart item shape returned by the DAL.
 */
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

/**
 * Get or create the cart for a user, returning items with computed totals.
 * Ownership is scoped by userId in the query.
 */
export async function getCart(userId: string): Promise<CartResult> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: {
      id: true,
      items: {
        select: {
          id: true,
          productId: true,
          quantity: true,
          price: true,
          customizations: true,
          product: {
            select: {
              name: true,
              images: {
                take: 1,
                orderBy: { order: "asc" },
                select: { url: true },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const items: CartItemResult[] = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.images[0]?.url ?? null,
    quantity: item.quantity,
    unitPrice: Number(item.price),
    customization: item.customizations as Record<string, unknown>,
    itemTotal: toItemTotal(item.price, item.quantity),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.itemTotal, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { id: cart.id, items, subtotal, itemCount };
}

export interface AddCartItemData {
  productId: string;
  variantId?: string | null;
  quantity: number;
  customizations?: Record<string, unknown>;
  customRequestId?: string | null;
}

/**
 * Add an item to the user's cart.
 * If the same product+variant+customizations already exists, increments quantity.
 * Ownership is scoped by userId in the query.
 */
export async function addCartItem(
  userId: string,
  data: AddCartItemData
): Promise<CartItemResult> {
  // Fetch product price server-side — never trust client-supplied price
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { basePrice: true, isActive: true },
  });

  if (!product || !product.isActive) {
    throw new Error("Product not found or inactive");
  }

  // If customRequestId is provided, verify it's APPROVED and belongs to user
  if (data.customRequestId) {
    const customRequest = await prisma.customRequest.findFirst({
      where: {
        id: data.customRequestId,
        userId,
        status: "APPROVED",
      },
      select: { id: true },
    });
    if (!customRequest) {
      throw new Error("Custom request not found, not approved, or not yours");
    }
  }

  // Compute unit price from base price + variant adjustment + add-on prices
  let unitPrice = Number(product.basePrice);

  if (data.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: data.variantId, productId: data.productId },
      select: { price: true },
    });
    if (variant) {
      unitPrice += Number(variant.price);
    }
  }

  const customizations = data.customizations ?? {};
  const addOnInput = (customizations as { addOns?: unknown }).addOns;
  const addOnIds: string[] = Array.isArray(addOnInput)
    ? addOnInput.filter((a): a is string => typeof a === "string")
    : [];

  // Fetch add-on names alongside prices so the customization data stored in
  // the cart item includes human-readable labels, not just IDs.
  let addOnNames: { id: string; name: string }[] = [];
  if (addOnIds.length > 0) {
    const addOns = await prisma.addOn.findMany({
      where: { id: { in: addOnIds } },
      select: { id: true, name: true, price: true },
    });
    for (const addOn of addOns) {
      unitPrice += Number(addOn.price);
    }
    addOnNames = addOns.map((a) => ({ id: a.id, name: a.name }));
  }

  // Replace raw add-on IDs with { id, name } objects in customizations
  // so the frontend can display names without another API call.
  if (addOnNames.length > 0) {
    (customizations as Record<string, unknown>).addOns = addOnNames;
  } else {
    delete (customizations as Record<string, unknown>).addOns;
  }

  // Round to 2 decimal places
  unitPrice = Math.round((unitPrice + Number.EPSILON) * 100) / 100;

  // Get or create cart
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });

  const cartItemSelect = {
    id: true,
    productId: true,
    quantity: true,
    price: true,
    customizations: true,
    product: {
      select: {
        name: true,
        images: {
          take: 1,
          orderBy: { order: "asc" as const },
          select: { url: true },
        },
      },
    },
  } satisfies Prisma.CartItemSelect;

  type CartItemPayload = Prisma.CartItemGetPayload<{ select: typeof cartItemSelect }>;

  function mapToResult(item: CartItemPayload): CartItemResult {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0]?.url ?? null,
      quantity: item.quantity,
      unitPrice: Number(item.price),
      customization: item.customizations as Record<string, unknown>,
      itemTotal: toItemTotal(item.price, item.quantity),
    };
  }

  // Use a transaction to atomically find-or-increment to prevent duplicate items
  // from concurrent requests.
  const result: CartItemPayload = await prisma.$transaction(async (tx) => {
    const existingItem = await tx.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId ?? null,
        customizations: { equals: customizations as Prisma.InputJsonValue },
      },
      select: { id: true, quantity: true },
    });

    if (existingItem) {
      return tx.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + data.quantity },
        select: cartItemSelect,
      }) as unknown as Promise<CartItemPayload>;
    }

    return tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId ?? null,
        quantity: data.quantity,
        price: unitPrice,
        customizations: customizations,
      },
      select: cartItemSelect,
    }) as unknown as Promise<CartItemPayload>;
  }) as CartItemPayload;

  return mapToResult(result);
}

/**
 * Update the quantity of a cart item.
 * Ownership is scoped in the query — returns null if not found or not owned.
 */
export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number
): Promise<CartItemResult | null> {
  try {
    const updated = await prisma.cartItem.update({
      where: {
        id: itemId,
        cart: { userId },
      },
      data: { quantity },
      select: {
        id: true,
        productId: true,
        quantity: true,
        price: true,
        customizations: true,
        product: {
          select: {
            name: true,
            images: {
              take: 1,
              orderBy: { order: "asc" },
              select: { url: true },
            },
          },
        },
      },
    });

    return {
      id: updated.id,
      productId: updated.productId,
      productName: updated.product.name,
      productImage: updated.product.images[0]?.url ?? null,
      quantity: updated.quantity,
      unitPrice: Number(updated.price),
      customization: updated.customizations as Record<string, unknown>,
      itemTotal: toItemTotal(updated.price, updated.quantity),
    };
  } catch {
    return null;
  }
}

/**
 * Remove a cart item.
 * Ownership is scoped in the query — returns false if not found or not owned.
 */
export async function removeCartItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  try {
    await prisma.cartItem.delete({
      where: {
        id: itemId,
        cart: { userId },
      },
    });
    return true;
  } catch {
    return false;
  }
}