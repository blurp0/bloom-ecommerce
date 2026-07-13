import { z } from "zod";

/**
 * Shared helper: validates that a string is a valid ISO date (YYYY-MM-DD)
 * *and* that the date is in the future (Philippine business time).
 *
 * The client sends date-only strings (e.g. "2026-07-13"), not full ISO
 * datetimes. Use z.iso.date(), not z.iso.datetime(), to match what the
 * frontend actually submits.
 *
 * Use this wherever a "must be a future date" field is needed so the
 * validation logic stays consistent across schemas.
 */
export function futureIsoDate(fieldLabel = "Date") {
  return z.iso
    .date({ message: "Invalid date string (expected YYYY-MM-DD)" })
    .refine((val) => {
      // Compare date-only values using Philippine business time (UTC+8)
      const phTimeZone = "Asia/Manila";
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: phTimeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const now = new Date();
      const parts = formatter.formatToParts(now);
      const year = parts.find((p) => p.type === "year")?.value ?? "";
      const month = parts.find((p) => p.type === "month")?.value ?? "";
      const day = parts.find((p) => p.type === "day")?.value ?? "";
      const phNow = `${year}-${month}-${day}`;
      return val > phNow;
    }, {
      message: `${fieldLabel} must be in the future`,
    });
}

/**
 * @deprecated Use futureIsoDate() instead. This helper remains for backward
 * compatibility with CreateProposalSchema (seller-side, actively used). Migration
 * to futureIsoDate() must be tracked before removing this function.
 */
export function futureIsoDateTime(fieldLabel = "Date") {
  return z.iso
    .datetime({ message: "Invalid ISO datetime string" })
    .refine((val) => new Date(val) > new Date(), {
      message: `${fieldLabel} must be in the future`,
    });
}
