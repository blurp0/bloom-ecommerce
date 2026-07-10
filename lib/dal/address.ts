import { prisma } from "@/lib/prisma/client";
import type { CreateAddressData, UpdateAddressData, AddressResponse } from "@/lib/validators/address";

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

/**
 * Get all saved addresses for a user.
 */
export async function getAddresses(clerkId: string): Promise<AddressResponse[]> {
  const userId = await resolveUserId(clerkId);
  const rows = await prisma.$queryRaw<AddressResponse[]>`
    SELECT id, label, "recipientName", phone, street, barangay, city, province, "zipCode", "isDefault"
    FROM "Address"
    WHERE "userId" = ${userId}
    ORDER BY "isDefault" DESC, id ASC
  `;
  return rows;
}

/**
 * Create a new address for a user.
 */
export async function createAddress(
  clerkId: string,
  data: CreateAddressData
): Promise<AddressResponse> {
  const userId = await resolveUserId(clerkId);
  const rows = await prisma.$queryRaw<AddressResponse[]>`
    INSERT INTO "Address" (id, "userId", label, "recipientName", phone, street, barangay, city, province, "zipCode", "isDefault")
    VALUES (gen_random_uuid()::text, ${userId}, ${data.label ?? null}, ${data.recipientName}, ${data.phone}, ${data.street}, ${data.barangay}, ${data.city}, ${data.province}, ${data.zipCode}, false)
    RETURNING id, label, "recipientName", phone, street, barangay, city, province, "zipCode", "isDefault"
  `;
  return rows[0];
}

/**
 * Update an existing address.
 * Ownership is enforced — returns null if not found or not owned.
 */
export async function updateAddress(
  clerkId: string,
  addressId: string,
  data: UpdateAddressData
): Promise<AddressResponse | null> {
  try {
    const userId = await resolveUserId(clerkId);
    const rows = await prisma.$queryRaw<AddressResponse[]>`
      UPDATE "Address"
      SET
        label            = COALESCE(${data.label ?? null}, label),
        "recipientName"  = COALESCE(${data.recipientName ?? null}, "recipientName"),
        phone            = COALESCE(${data.phone ?? null}, phone),
        street           = COALESCE(${data.street ?? null}, street),
        barangay         = COALESCE(${data.barangay ?? null}, barangay),
        city             = COALESCE(${data.city ?? null}, city),
        province         = COALESCE(${data.province ?? null}, province),
        "zipCode"        = COALESCE(${data.zipCode ?? null}, "zipCode")
      WHERE id = ${addressId} AND "userId" = ${userId}
      RETURNING id, label, "recipientName", phone, street, barangay, city, province, "zipCode", "isDefault"
    `;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Delete an address.
 * Ownership is enforced — returns false if not found or not owned.
 */
export async function deleteAddress(
  clerkId: string,
  addressId: string
): Promise<boolean> {
  try {
    const userId = await resolveUserId(clerkId);
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      DELETE FROM "Address"
      WHERE id = ${addressId} AND "userId" = ${userId}
      RETURNING id
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
