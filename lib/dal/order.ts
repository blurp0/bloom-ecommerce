import { prisma } from "@/lib/prisma/client";
import { type CreateOrderInput } from "@/lib/validators/order";

export interface CreateOrderResult {
  id: string;
  orderNumber: string;
  orderTotal: number;
  estimatedDelivery: string;
}

export interface OrderLineItem {
  cartItemId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  customizations: Record<string, unknown>;
  unitPrice: number;
}

function toItemTotal(price: number, quantity: number): number {
  return Math.round((price * quantity + Number.EPSILON) * 100) / 100;
}

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "BB-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createOrder(userId: string, data: CreateOrderInput): Promise<CreateOrderResult> {
  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: data.addressId, userId },
    select: { id: true },
  });

  if (!address) {
    throw new Error("Address not found or does not belong to user");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Fetch user's cart with items
    const cart = await tx.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            productId: true,
            variantId: true,
            quantity: true,
            customizations: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    // Filter to selected items only and ensure all selected IDs exist in cart
    const selectedItems = cart.items.filter((item) => data.selectedItemIds.includes(item.id));

    if (selectedItems.length !== data.selectedItemIds.length) {
      throw new Error("One or more selected items do not belong to the user's cart");
    }

    // Re-fetch prices server-side for each item
    const lineItems: OrderLineItem[] = await Promise.all(
      selectedItems.map(async (item) => {
        let unitPrice = 0;

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { basePrice: true },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        unitPrice = Number(product.basePrice);

        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { price: true },
          });
          if (variant) {
            unitPrice += Number(variant.price);
          }
        }

        // Re-fetch add-on prices from customization JSON
        const customizations = item.customizations as { addOns?: Array<{ id: string }> };
        const addOnIds: string[] = customizations.addOns?.map((a) => a.id) ?? [];

        if (addOnIds.length > 0) {
          const addOns = await tx.addOn.findMany({
            where: { id: { in: addOnIds } },
            select: { price: true },
          });

          for (const addOn of addOns) {
            unitPrice += Number(addOn.price);
          }
        }

        unitPrice = Math.round((unitPrice + Number.EPSILON) * 100) / 100;

        return {
          cartItemId: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          customizations: item.customizations as Record<string, unknown>,
          unitPrice,
        };
      })
    );

    // Compute totals
    let orderSubtotal = 0;
    for (const line of lineItems) {
      orderSubtotal += toItemTotal(line.unitPrice, line.quantity);
    }
    orderSubtotal = Math.round((orderSubtotal + Number.EPSILON) * 100) / 100;

    const deliveryFee = 0;
    const orderTotal = orderSubtotal + deliveryFee;

    // Create Order
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        subtotal: orderSubtotal,
        deliveryFee,
        total: orderTotal,
        deliveryAddress: data.addressId,
        deliveryDate: new Date(data.deliveryDate),
        deliverySlot: data.timeSlot,
        paymentMethod: data.paymentMethod,
      },
      select: {
        id: true,
        orderNumber: true,
      },
    });

    // Create OrderItems
    await Promise.all(
      lineItems.map((line) =>
        tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            customizations: line.customizations,
            price: line.unitPrice,
          },
        })
      )
    );

    // Delete only the selected cart items
    await tx.cartItem.deleteMany({
      where: {
        id: { in: selectedItems.map((i) => i.id) },
        cartId: cart.id,
      },
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderTotal,
      estimatedDelivery: data.deliveryDate,
    };
  });

  return result;
}