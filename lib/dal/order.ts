import { prisma } from "@/lib/prisma/client";
import { type CreateOrderInput, type UpdateOrderStatusInput } from "@/lib/validators/order";
import type { OrderStatus } from "@prisma/client";

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

/**
 * Resolve the internal User.id from a Clerk user ID.
 * Throws if the user doesn't exist in the database.
 */
async function resolveUserId(clerkId: string): Promise<string> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
  `;
  if (!rows[0]) throw new Error("User not found");
  return rows[0].id;
}

export async function createOrder(clerkId: string, data: CreateOrderInput): Promise<CreateOrderResult> {
  // Resolve Clerk ID to internal User.id
  const userId = await resolveUserId(clerkId);

  // Verify address belongs to user and fetch full details for snapshot
  const addressRecord = await prisma.address.findFirst({
    where: { id: data.addressId, userId },
    select: {
      id: true,
      recipientName: true,
      phone: true,
      street: true,
      barangay: true,
      city: true,
      province: true,
      zipCode: true,
      label: true,
    },
  });

  if (!addressRecord) {
    throw new Error("Address not found or does not belong to user");
  }

  // Serialize a JSON snapshot of the address so the order retains shipping
  // details even if the address is later changed or deleted.
  const deliveryAddressSnapshot = JSON.stringify({
    recipientName: addressRecord.recipientName,
    phone: addressRecord.phone,
    street: addressRecord.street,
    barangay: addressRecord.barangay,
    city: addressRecord.city,
    province: addressRecord.province,
    zipCode: addressRecord.zipCode,
  });

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
        const customizations = item.customizations as Record<string, unknown> | null;
        const addOns = (customizations?.addOns as Array<{ id: string }> | undefined) ?? [];
        const addOnIds: string[] = addOns.map((a) => a.id);

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
        deliveryAddress: deliveryAddressSnapshot,
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

/**
 * Update the status of an order, constrained by the current status to
 * prevent concurrent requests from applying stale transitions.
 * Authorization (seller-only) must be enforced by the caller.
 * Returns null when zero rows are affected (concurrent conflict).
 */
export async function updateOrderStatus(
  orderId: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
): Promise<{ id: string; orderNumber: string; status: OrderStatus } | null> {
  try {
    const order = await prisma.order.update({
      where: { id: orderId, status: currentStatus },
      data: { status: newStatus },
      select: { id: true, orderNumber: true, status: true },
    });

    return order;
  } catch {
    // Prisma throws P2025 (Record to update not found) when the
    // where clause doesn't match — that means the status changed
    // between our read and write.
    return null;
  }
}