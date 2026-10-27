import { ProviderError } from "../booking/common";

// Read-only Tiqets request helper. The host is the constant prefix below (it ends
// in "/"), the path is restricted to a plain relative path, and only GET is used.
// TourDesk and Viator reuse tdRequest/viatorRequest from lib/booking/products.ts.
export async function tiqetsRequest(
  path: string,
  cacheSeconds: number,
): Promise<unknown> {
  const key = process.env.TIQETS_API_KEY?.trim();
  if (!key) throw new ProviderError(503);
  if (
    !/^[A-Za-z0-9._~\-\/%?=&,+]{1,400}$/.test(path) ||
    path.includes("..") ||
    path.includes("//")
  )
    throw new ProviderError(502);
  const url = "https://api.tiqets.com/" + path.replace(/^\/+/, "");
  let r: Response;
  try {
    r = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${key}`,
        Accept: "application/json",
        // Tiqets requires a descriptive User-Agent.
        "User-Agent": "GoToBudapest/1.0",
      },
      signal: AbortSignal.timeout(8500),
      ...(cacheSeconds ? { next: { revalidate: cacheSeconds } } : { cache: "no-store" as const }),
    });
  } catch {
    throw new ProviderError(502);
  }
  if (!r.ok) {
    console.warn("[marketplace] api.tiqets.com", r.status);
    throw new ProviderError(r.status === 404 ? 404 : 502, undefined, r.status);
  }
  if (Number(r.headers.get("content-length") || "0") > 2_000_000)
    throw new ProviderError(502);
  try {
    return await r.json();
  } catch {
    throw new ProviderError(502);
  }
}
