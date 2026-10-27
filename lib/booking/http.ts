import { NextResponse } from "next/server";
import { ProviderError } from "./common";
import { rateLimitScale } from "../rate-limit";
// Best-effort per-instance abuse control; platform rate limits complement this.
const buckets = new Map<string, { count: number; until: number }>();
// Test support only: contract tests call the route handlers in-process, so one worker
// shares this module (and the 30/min budget of its single address) across many tests.
// Resetting the in-memory counters between tests keeps the limiter itself unchanged:
// requests from the same address are still limited (see the dedicated limiter test).
// Nothing in the application or any route calls this.
export function resetBookingGateForTests() {
  buckets.clear();
}
export function gate(request: Request): NextResponse | undefined {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const key = (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  ).slice(0, 100);
  const now = Date.now();
  for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  if (buckets.size >= 5000 && !buckets.has(key))
    return NextResponse.json(
      { error: "Please try again shortly" },
      { status: 429 },
    );
  const b = buckets.get(key) || { count: 0, until: now + 60000 };
  b.count++;
  buckets.set(key, b);
  if (b.count > 30 * rateLimitScale())
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
}
export async function readBody(request: Request): Promise<unknown> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ProviderError(415, "Use application/json");
  const reader = request.body?.getReader();
  if (!reader) throw new ProviderError(400, "Invalid request");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 16000) {
      await reader.cancel();
      throw new ProviderError(413, "Request too large");
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, at);
    at += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    throw new ProviderError(400, "Invalid JSON");
  }
}
export function failure(e: unknown) {
  return NextResponse.json(
    {
      error:
        e instanceof ProviderError
          ? e.message
          : "Booking temporarily unavailable. Please try again.",
    },
    {
      status: e instanceof ProviderError ? e.status : 502,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
