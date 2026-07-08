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

// Periodic cleanup: evict expired entries every 5 minutes so the Map
// cannot grow indefinitely when many unique keys accumulate over time.
// The interval is unref'd so it does not prevent the process from exiting.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node.js to exit cleanly even if this timer is still pending
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether `key` is within the allowed rate.
 *
 * Uses a fixed window strategy: each key gets a window of `windowMs`
 * milliseconds starting from the first request. The counter resets
 * when the window expires. A new window is created on the next request
 * after expiry.
 *
 * @param key      Unique key for this rate-limit bucket, e.g. `"endpoint:ip"`.
 * @param limit    Maximum number of requests allowed within `windowMs`.
 * @param windowMs Length of the fixed window in milliseconds.
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
