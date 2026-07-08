/**
 * In-memory rate limiter.
 *
 * PRODUCTION NOTE: This implementation uses a module-level Map that is
 * reset on every server restart. It is suitable for single-instance
 * development and preview environments only. Before scaling to multiple
 * instances (e.g. multi-region Vercel), replace this store with a shared
 * external store such as Upstash Redis to avoid per-instance counters
 * drifting out of sync.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether `key` is within the allowed rate.
 *
 * @param key      Unique key for this rate-limit bucket, e.g. `"endpoint:ip"`.
 * @param limit    Maximum number of requests allowed within `windowMs`.
 * @param windowMs Length of the sliding window in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    // First request in this window (or window has expired — start fresh)
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    // Window still active and limit already reached
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Within window and below limit — increment counter
  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract the client IP from an incoming request.
 *
 * Reads `x-forwarded-for` first (set by Vercel and most CDNs at the edge).
 * The header may contain a comma-separated list of IPs; the first value is
 * the original client. Falls back to `"unknown"` if the header is absent.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take only the first IP in the (potentially comma-separated) list
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
