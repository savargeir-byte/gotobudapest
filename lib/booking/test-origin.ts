// Test-only redirect of SERVER-SIDE provider API requests to a local mock.
//
// Honoured only when ALL of these hold, otherwise ignored (silently, nothing is
// logged and no value is echoed):
//   - BOOKING_MOCK_ORIGIN is exactly http://127.0.0.1:<port> or http://localhost:<port>
//     (no path, query, credentials or other host),
//   - VERCEL_ENV is not "production".
// Only the provider API hosts below are rewritten. Checkout and booking URLs that
// providers return are validated by the unchanged exact-host allowlists, so this
// hook cannot make a mock-supplied URL acceptable.
const LOOPBACK = /^http:\/\/(?:127\.0\.0\.1|localhost):([0-9]{1,5})$/;

const PREFIXES: Record<string, string> = {
  "api.tourdesk.io": "/__td",
  "api.viator.com": "/__viator",
  "api.sandbox.viator.com": "/__viator",
  "api.tiqets.com": "/__tiqets",
};

export function mockOrigin(
  env: Record<string, string | undefined> = process.env,
): string | undefined {
  if (env.VERCEL_ENV === "production") return undefined;
  const value = env.BOOKING_MOCK_ORIGIN;
  if (typeof value !== "string") return undefined;
  const match = LOOPBACK.exec(value);
  if (!match) return undefined;
  const port = Number(match[1]);
  return port >= 1 && port <= 65535 ? value : undefined;
}

export function providerUrl(
  url: string,
  env: Record<string, string | undefined> = process.env,
): string {
  const origin = mockOrigin(env);
  if (!origin) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const prefix = PREFIXES[parsed.hostname];
  if (parsed.protocol !== "https:" || !prefix) return url;
  return origin + prefix + parsed.pathname + parsed.search;
}
