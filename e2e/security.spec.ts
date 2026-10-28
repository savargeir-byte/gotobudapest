import { expect, test } from "@playwright/test";
import { encodeSignatureHeader } from "@sanity/webhook";

// The local Playwright web server is started with this secret (see
// playwright.config.ts). Against a deployed site, signed-request tests only run
// when PW_REVALIDATE_SECRET is provided.
const secret = process.env.PW_REVALIDATE_SECRET || "";
const publicPages = ["/", "/attractions", "/guides/danube-cruises", "/experiences/danube"];
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "ut6qxuke";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

test.describe("security headers", () => {
  for (const path of publicPages) {
    test(`public page ${path}`, async ({ request }) => {
      const res = await request.get(path);
      const h = res.headers();
      const csp = h["content-security-policy"] ?? "";
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).not.toMatch(/script-src[^;]*https?:/); // no third-party scripts
      expect(csp).not.toContain("*");
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toContain("camera=()");
      expect(h["x-frame-options"]).toBe("DENY");
      expect(h["x-powered-by"]).toBeUndefined();
      const hsts = h["strict-transport-security"] ?? "";
      expect(hsts).toContain("max-age=");
      expect(hsts).not.toContain("includeSubDomains");
      expect(hsts).not.toContain("preload");
    });
  }

  test("the Studio route keeps enforced anti-framing and a report-only policy", async ({ request }) => {
    const res = await request.get("/studio");
    expect(res.status()).toBe(200);
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'self'");
    expect(h["content-security-policy"]).toContain("object-src 'none'");
    expect(h["content-security-policy-report-only"]).toContain("connect-src");
    expect(h["x-frame-options"]).toBe("SAMEORIGIN");
    expect(h["cache-control"]).toContain("no-store");
    expect(h["strict-transport-security"]).not.toContain("includeSubDomains");
  });
});

test.describe("Studio", () => {
  test("loads behind Sanity authentication without page errors or CSP violations", async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      const t = m.text();
      if (/content security policy|refused to|\[report only\]/i.test(t))
        problems.push(`csp: ${t.slice(0, 300)}`);
    });
    const res = await page.goto("/studio", { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    // Not signed in: the Studio shows a login screen, or (for an origin that is
    // not yet in the project's CORS list) the "add CORS origin" prompt. It must
    // never show the editing desk.
    await expect(
      page
        .getByText(/sign in|log in|choose login provider|login|add cors origin|cors origin/i)
        .first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Attractions|Site settings/i)).toHaveCount(0);
    expect(problems).toEqual([]);
    // Site styling must not leak into the Studio.
    const siteHeader = await page.locator("header.hero, .skip, .quicknav").count();
    expect(siteHeader).toBe(0);
  });

  test("Studio is not indexable", async ({ page }) => {
    await page.goto("/studio");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
  });
});

test.describe("Sanity data exposure", () => {
  const api = `https://${projectId}.api.sanity.io/v2026-10-01/data/query/${dataset}`;

  test("drafts and unpublished documents are not readable without a token", async ({ request }) => {
    const q = encodeURIComponent('count(*[_id in path("drafts.**")])');
    const res = await request.get(`${api}?query=${q}`);
    expect(res.status()).toBe(200);
    expect((await res.json()).result).toBe(0);
  });

  test("anonymous clients cannot write", async ({ request }) => {
    const res = await request.post(`https://${projectId}.api.sanity.io/v2026-10-01/data/mutate/${dataset}`, {
      data: { mutations: [{ create: { _type: "attraction", _id: "attraction.pw-should-not-exist", name: "x" } }] },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("CORS: an unapproved origin is not granted credentialed access", async ({ request }) => {
    const res = await request.fetch(`${api}?query=${encodeURIComponent("count(*)")}`, {
      headers: { Origin: "https://evil.example" },
    });
    const allow = res.headers()["access-control-allow-origin"];
    const creds = res.headers()["access-control-allow-credentials"];
    // Public reads may be anonymous-CORS (no credentials); never a credentialed wildcard.
    expect(!(allow === "*" && creds === "true")).toBe(true);
    if (allow !== undefined) expect(allow).not.toBe("https://evil.example");
  });
});

test.describe("revalidation webhook", () => {
  const body = JSON.stringify({ _type: "guide", _id: "guide.danube-cruises", operation: "update" });
  const headers = { "content-type": "application/json" };

  test("only POST is accepted", async ({ request }) => {
    expect((await request.get("/api/revalidate")).status()).toBe(405);
    expect((await request.put("/api/revalidate", { data: body, headers })).status()).toBe(405);
    expect((await request.delete("/api/revalidate")).status()).toBe(405);
  });

  test("unsigned requests are rejected", async ({ request }) => {
    const res = await request.post("/api/revalidate", { data: body, headers });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ ok: false });
  });

  test("invalidly signed requests are rejected", async ({ request }) => {
    const wrong = await encodeSignatureHeader(body, Date.now(), "not-the-secret");
    const res = await request.post("/api/revalidate", {
      data: body,
      headers: { ...headers, "sanity-webhook-signature": wrong },
    });
    expect(res.status()).toBe(401);
    const malformed = await request.post("/api/revalidate", {
      data: body,
      headers: { ...headers, "sanity-webhook-signature": "garbage" },
    });
    expect(malformed.status()).toBe(401);
  });

  test("wrong content type and oversized bodies are rejected before parsing", async ({ request }) => {
    expect(
      (await request.post("/api/revalidate", { data: body, headers: { "content-type": "text/plain" } })).status(),
    ).toBe(415);
    const big = JSON.stringify({ _type: "guide", pad: "x".repeat(40_000) });
    expect(
      (await request.post("/api/revalidate", { data: big, headers })).status(),
    ).toBe(413);
  });

  test("correctly signed requests revalidate; unknown document types are refused", async ({ request }) => {
    test.skip(!secret, "needs PW_REVALIDATE_SECRET (set automatically for the local server)");
    const signed = await encodeSignatureHeader(body, Date.now(), secret);
    const ok = await request.post("/api/revalidate", {
      data: body,
      headers: { ...headers, "sanity-webhook-signature": signed },
    });
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toMatchObject({ ok: true, revalidated: ["sanity"], type: "guide" });

    const evil = JSON.stringify({ _type: "secretThing", path: "/../../etc" });
    const refused = await request.post("/api/revalidate", {
      data: evil,
      headers: {
        ...headers,
        "sanity-webhook-signature": await encodeSignatureHeader(evil, Date.now(), secret),
      },
    });
    expect(refused.status()).toBe(400);
  });
});

test.describe("secrets and removed features", () => {
  test("no secrets or token names appear in served HTML or JavaScript", async ({ page, request }) => {
    const urls = new Set<string>();
    page.on("response", (r) => {
      const u = r.url();
      if (/\.js(\?|$)/.test(u) || r.request().resourceType() === "document") urls.add(u);
    });
    for (const p of ["/", "/attractions", "/studio"]) await page.goto(p, { waitUntil: "networkidle" });
    expect(urls.size).toBeGreaterThan(3);
    const forbidden = [/SANITY_API_TOKEN/, /SANITY_REVALIDATE_SECRET/, /playwright-test-secret/, /\bsk[A-Za-z0-9]{40,}\b/];
    if (secret) forbidden.push(new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    for (const u of urls) {
      const res = await request.get(u);
      const text = await res.text();
      for (const re of forbidden) expect(text, `${u} matches ${re}`).not.toMatch(re);
    }
  });

  test("source maps are not published", async ({ request, page }) => {
    const scripts: string[] = [];
    page.on("response", (r) => /\/_next\/static\/.*\.js$/.test(r.url()) && scripts.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts.slice(0, 5)) {
      expect((await request.get(s + ".map")).status()).toBe(404);
    }
  });

  test("no diagnostic or planner endpoints exist", async ({ request }) => {
    for (const p of ["/plan", "/api/env", "/api/debug", "/api/config", "/api/preview", "/api/draft"]) {
      expect((await request.get(p)).status(), p).toBe(404);
    }
  });
});
