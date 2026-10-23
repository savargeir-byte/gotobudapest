// Small fixed-window rate limiter. State is per server instance, so it is a
// speed bump against floods on one instance, not a global quota: the Vercel
// Firewall rule documented in SECURITY.md provides the platform-level limit.
type Bucket = { count: number; resetAt: number };

export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();
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
    return bucket.count <= limit;
  };
}
