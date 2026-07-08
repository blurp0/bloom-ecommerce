import { z } from "zod";

/**
 * Shared helper: validates that a string is a valid ISO datetime
 * (using Zod v4's z.iso.datetime()) *and* that the date is in the future.
 *
 * Use this wherever a "must be a future ISO datetime string" field is needed
 * so the validation logic stays consistent across schemas.
 */
export function futureIsoDateTime(fieldLabel = "Date") {
  return z.iso
    .datetime({ message: "Invalid ISO date string" })
    .refine((val) => new Date(val) > new Date(), {
      message: `${fieldLabel} must be in the future`,
    });
}
