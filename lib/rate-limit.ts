// Small fixed-window rate limiter. State is per server instance, so it is a
// speed bump against floods on one instance, not a global quota: the Vercel
// Firewall rule documented in SECURITY.md provides the platform-level limit.
type Bucket = { count: number; resetAt: number };

// Test servers share one loopback address across every browser test, so they may scale
// the per-address budget with RATE_LIMIT_TEST_SCALE (an integer 1-1000). The scale is
// ignored on Vercel (production, preview and development) and for any other value, so a
// deployment always enforces the real limit; the dedicated rate-limit tests run an
// unscaled server and prove the real limit.
export function rateLimitScale(env: Record<string, string | undefined> = process.env): number {
  if (env.VERCEL) return 1;
  const raw = env.RATE_LIMIT_TEST_SCALE;
  if (typeof raw !== "string" || !/^[0-9]{1,4}$/.test(raw)) return 1;
  const n = Number(raw);
  return n >= 1 && n <= 1000 ? n : 1;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();
  const max = limit * rateLimitScale();
  return function allow(key: string, now = Date.now()): boolean {
    if (buckets.size > 5_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= max;
  };
}
