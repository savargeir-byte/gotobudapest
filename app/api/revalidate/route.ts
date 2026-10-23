import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { createRateLimiter } from "@/lib/rate-limit";

// Sanity webhook receiver. It can only refresh cached content: it writes
// nothing, accepts no paths from the caller and acts only on a body whose
// HMAC signature matches SANITY_REVALIDATE_SECRET.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const allowedTypes = new Set([
  "attraction",
  "guide",
  "experience",
  "neighbourhood",
  "region",
  "category",
  "siteSettings",
]);
const allow = createRateLimiter(30, 60_000);

type Payload = { _type?: unknown; _id?: unknown; operation?: unknown };

function reject(status: number, reason: string, log = true) {
  // The reason is a fixed label; request contents and secrets are never logged.
  if (log) console.warn(`[revalidate] rejected (${status}): ${reason}`);
  return NextResponse.json(
    { ok: false },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not configured");
    return reject(503, "not configured", false);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) return reject(429, "rate limited");

  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return reject(415, "unsupported content type");
  const length = Number(req.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return reject(411, "length required");
  if (length > MAX_BODY_BYTES) return reject(413, "payload too large");

  let parsed;
  try {
    parsed = await parseBody<Payload>(req, secret, false);
  } catch {
    return reject(400, "unreadable body");
  }
  if (parsed.isValidSignature !== true) return reject(401, "invalid signature");

  const type = parsed.body?._type;
  if (typeof type !== "string" || !allowedTypes.has(type))
    return reject(400, "unsupported document type");

  // Fixed tags only: the caller cannot choose what gets revalidated.
  revalidateTag("sanity", { expire: 0 });
  return NextResponse.json(
    { ok: true, revalidated: ["sanity"], type },
    { headers: { "Cache-Control": "no-store" } },
  );
}
