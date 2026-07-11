"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAddressData,
  UpdateAddressData,
  AddressResponse,
} from "@/lib/validators/address";

const ADDRESSES_QUERY_KEY = ["addresses"] as const;

/**
 * Fetch the authenticated user's saved addresses.
 */
async function fetchAddresses(): Promise<AddressResponse[]> {
  const res = await fetch("/api/addresses");
  if (!res.ok) {
    throw new Error("Failed to fetch addresses");
  }
  const json = await res.json();
  return json.data as AddressResponse[];
}

/**
 * Create a new address.
 */
async function createAddress(
  data: CreateAddressData
): Promise<AddressResponse> {
  const res = await fetch("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to create address");
  }
  const json = await res.json();
  return json.data as AddressResponse;
}

/**
 * Update an existing address.
 */
async function updateAddress(
  addressId: string,
  data: UpdateAddressData
): Promise<AddressResponse> {
  const res = await fetch(`/api/addresses/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to update address");
  }
  const json = await res.json();
  return json.data as AddressResponse;
}

/**
 * Delete an address.
 */
async function deleteAddress(addressId: string): Promise<void> {
  const res = await fetch(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error ?? "Failed to delete address");
  }
}

/**
 * Hook to fetch saved addresses.
 */
export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: fetchAddresses,
  });
}

/**
 * Hook to create a new address. Invalidates the addresses list on success.
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

/**
 * Hook to update an existing address. Invalidates the addresses list on success.
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: UpdateAddressData }) =>
      updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}

/**
 * Hook to delete an address. Invalidates the addresses list on success.
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}