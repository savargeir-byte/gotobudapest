// Issue #11 (blurry tour-card photos). MOCKED: a local provider mock supplies Viator renditions
// of known widths and this test serves a PNG of exactly that width, so the browser's own choice
// can be measured: naturalWidth (what it downloaded) against rendered width x devicePixelRatio
// (what the card needs) against the variant metadata exposed in the img srcset.
// No live provider or photo is contacted; with a real key only the data differs, the selection
// logic under test is identical (see docs/RELEASE_STATUS.md, "Image quality (issue #11)").
import { deflateSync } from "node:zlib";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Same dedicated server (port 3101) as the other mocked UI specs; runs once, creating its own
// DPR1/DPR2 desktop and mobile contexts so the matrix does not depend on the project device.
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "booking-ui-desktop", "builds its own desktop and mobile contexts");
});

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const sum = Buffer.alloc(4);
  sum.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, sum]);
};
const pngCache = new Map<number, Buffer>();
// A solid-colour PNG of exactly `w` x (w * 2/3) pixels: only its natural size matters here.
function png(w: number): Buffer {
  const hit = pngCache.get(w);
  if (hit) return hit;
  const h = Math.round((w * 2) / 3);
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) row.set([30, 100 + (w % 100), 140], 1 + x * 3);
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head.set([8, 2, 0, 0, 0], 8);
  const out = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", head),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  pngCache.set(w, out);
  return out;
}

// Width encoded in the mock URL: /v/<code>-<w>.jpg, the legacy -small (200) / -large (800) pair, /td/<key>.jpg (1000).
function widthOf(url: URL): number {
  if (url.pathname.startsWith("/td/")) return 1000;
  const m = /^\/v\/\w+-(\d+)\.jpg$/.exec(url.pathname);
  if (m) return Number(m[1]);
  if (url.pathname.endsWith("-small.jpg")) return 200;
  if (url.pathname.endsWith("-large.jpg")) return 800;
  return 1000;
}

type Seen = { widths: number[]; hosts: string[] };
async function prepare(ctx: BrowserContext): Promise<Seen> {
  const seen: Seen = { widths: [], hosts: [] };
  await ctx.route(
    (url) => !["localhost", "127.0.0.1"].includes(url.hostname),
    async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      seen.hosts.push(`${req.resourceType()} ${url.hostname}`);
      if (req.resourceType() !== "image") return route.abort();
      const w = widthOf(url);
      seen.widths.push(w);
      return route.fulfill({ status: 200, contentType: "image/png", body: png(w) });
    },
  );
  return seen;
}

type Shot = {
  id: string;
  currentSrc: string;
  srcset: string;
  loading: string | null;
  fetchPriority: string | null;
  limited: boolean;
  naturalWidth: number;
  complete: boolean;
  w: number;
  h: number;
  dpr: number;
  filter: string;
  transform: string;
  fit: string;
  src: string;
};

async function collect(page: Page, scope = "body"): Promise<Shot[]> {
  // lazy images load on approach: scroll each card image into view, then wait for the downloads
  await page.evaluate(async (sel) => {
    for (const img of document.querySelectorAll<HTMLImageElement>(`${sel} .mk-card-img img`)) {
      img.scrollIntoView({ block: "center" });
      await new Promise((r) => setTimeout(r, 40));
    }
  }, scope);
  await page.waitForFunction(
    (sel) =>
      [...document.querySelectorAll<HTMLImageElement>(`${sel} .mk-card-img img`)].every((i) => i.complete),
    scope,
    { timeout: 15_000 },
  );
  return page.evaluate(async (sel) => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(`${sel} .mk-card-img img`)];
    // img.naturalWidth of a srcset image is divided by the chosen density, so the true bitmap
    // width is read from a plain <img> of the same file (no srcset): independent of our metadata.
    const bitmap = await Promise.all(
      imgs.map(async (img) => {
        const probe = new Image();
        probe.src = img.currentSrc;
        await probe.decode().catch(() => undefined);
        return probe.naturalWidth;
      }),
    );
    return imgs.map((img, i) => {
      const box = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      return {
        id: img.closest(".mk-card")?.getAttribute("data-product") ?? "",
        currentSrc: img.currentSrc,
        srcset: img.getAttribute("srcset") ?? "",
        loading: img.getAttribute("loading"),
        fetchPriority: img.getAttribute("fetchpriority"),
        limited: img.closest(".mk-card-img")?.getAttribute("data-source-limited") === "true",
        naturalWidth: bitmap[i],
        complete: img.complete,
        w: box.width,
        h: box.height,
        dpr: window.devicePixelRatio,
        filter: cs.filter,
        transform: cs.transform,
        fit: cs.objectFit,
        src: img.getAttribute("src") ?? "",
      };
    });
  }, scope);
}

const candidates = (srcset: string) =>
  srcset
    .split(",")
    .map((c) => c.trim().split(/\s+/))
    .filter((p) => p.length === 2)
    .map(([url, d]) => ({ url, width: Number(d.replace("w", "")) }));

// The assertions that make a card photo "sharp enough" without being wasteful.
function assertSharp(s: Shot, where: string) {
  const tag = `${where} ${s.id} @${s.dpr}x`;
  expect(s.complete && s.naturalWidth > 0, `${tag}: image loaded`).toBe(true);
  expect(s.naturalWidth, `${tag}: never a thumbnail`).toBeGreaterThanOrEqual(320);
  expect(s.naturalWidth, `${tag}: bounded weight`).toBeLessThanOrEqual(1200);
  expect(s.filter, `${tag}: no CSS blur`).toBe("none");
  expect(s.transform, `${tag}: no CSS scaling`).toBe("none");
  expect(s.fit, `${tag}: cover`).toBe("cover");
  expect(Math.abs(s.w / s.h - 1.6), `${tag}: 16:10 box`).toBeLessThan(0.03);

  const needed = Math.ceil(s.w * s.dpr);
  const set = candidates(s.srcset);
  if (set.length) {
    const chosen = set.find((c) => c.url === s.currentSrc);
    expect(chosen, `${tag}: browser picked a declared candidate`).toBeTruthy();
    // metadata == file: the variant width we declared is the width that was downloaded
    expect(s.naturalWidth, `${tag}: variant metadata matches the file`).toBe(chosen!.width);
    const widest = Math.max(...set.map((c) => c.width));
    expect(s.naturalWidth, `${tag}: covers rendered width x DPR (or is the widest we have)`).toBeGreaterThanOrEqual(
      Math.min(needed, widest) * 0.97,
    );
    // never heavier than needed: `sizes` may exceed the measured width by a few percent (15% is
    // allowed), so the pick is at most the smallest rendition covering needed x 1.15
    const ceiling = set.filter((c) => c.width >= needed * 1.15).sort((x, y) => x.width - y.width)[0];
    if (ceiling) expect(s.naturalWidth, `${tag}: no heavier than needed`).toBeLessThanOrEqual(ceiling.width);
  } else {
    // a single supplied URL (TourDesk photoUrl, or one usable Viator rendition): used as-is
    expect(s.currentSrc, `${tag}: served exactly the supplied URL`).toBe(s.src);
    expect(s.naturalWidth, `${tag}: supplied photo large enough`).toBeGreaterThanOrEqual(Math.min(needed, 760) * 0.97);
  }
}

const MATRIX = [
  { name: "desktop DPR1", viewport: { width: 1440, height: 900 }, dpr: 1, mobile: false },
  { name: "desktop DPR2", viewport: { width: 1440, height: 900 }, dpr: 2, mobile: false },
  { name: "mobile DPR2", viewport: { width: 390, height: 844 }, dpr: 2, mobile: true },
  { name: "mobile DPR3", viewport: { width: 412, height: 915 }, dpr: 3, mobile: true },
];

for (const m of MATRIX) {
  test.describe(`card photos: ${m.name}`, () => {
    let ctx: BrowserContext;
    let page: Page;
    let seen: Seen;
    test.beforeEach(async ({ browser }, info) => {
      ctx = await browser.newContext({
        baseURL: info.project.use.baseURL,
        viewport: m.viewport,
        deviceScaleFactor: m.dpr,
        isMobile: m.mobile,
        hasTouch: m.mobile,
      });
      seen = await prepare(ctx);
      page = await ctx.newPage();
    });
    test.afterEach(async () => {
      await ctx?.close();
    });

    test("marketplace /tours: Viator cards choose a sufficient real rendition; no thumbnail is ever fetched", async () => {
      await page.goto("/tours?provider=viator");
      await expect(page.locator(".mk-card").first()).toBeVisible();
      const shots = await collect(page, "main");
      expect(shots.length).toBeGreaterThan(3);
      for (const s of shots) assertSharp(s, "/tours");

      // eager only for the first (above-the-fold) cards, everything else lazy
      expect(shots.slice(0, 3).every((s) => s.loading === "eager" && s.fetchPriority === "high")).toBe(true);
      expect(shots.slice(3).every((s) => s.loading === "lazy")).toBe(true);

      // the large source (VP001 has 100/480/720/1080/1600): 1080 at most, never the 1600 original
      const big = shots.find((s) => s.id === "viator:VP001");
      if (big) {
        expect(candidates(big.srcset).map((c) => c.width)).toEqual([480, 720, 1080]);
        expect(big.naturalWidth).toBeLessThanOrEqual(1080);
      }
      // a 400 px source is shown as supplied and flagged, never swapped for something bigger
      const small = shots.find((s) => s.id === "viator:VP004");
      if (small) {
        expect(small.naturalWidth).toBe(400);
        expect(small.limited).toBe(true);
      }
      // thumbnails (100/200 px) were never downloaded for any card
      expect(seen.widths.filter((w) => w < 320)).toEqual([]);
      expect(seen.widths.filter((w) => w > 1200)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    });

    test("a product with only thumbnail renditions gets a designed text card, not a stretched photo", async () => {
      await page.goto("/tours?provider=viator");
      const card = page.locator('.mk-card[data-product="viator:VP005"]');
      await expect(card).toBeVisible();
      await expect(card.locator("img")).toHaveCount(0);
      await expect(card.locator(".mk-card-top .mk-badge")).toHaveText("Viator");
      await expect(card.getByRole("link", { name: /View details/ })).toHaveAttribute("href", "/tours/viator/VP005");
      expect(seen.hosts.filter((h) => h.startsWith("document "))).toEqual([]);
    });

    test("TourDesk keeps its single supplied photo URL; Tiqets (no licensed photo) stays a text card", async () => {
      await page.goto("/tours?provider=tourdesk");
      await expect(page.locator(".mk-card").first()).toBeVisible();
      const td = await collect(page, "main");
      expect(td.length).toBeGreaterThan(0);
      for (const s of td) {
        assertSharp(s, "tourdesk");
        expect(s.srcset).toBe("");
        expect(s.currentSrc).toMatch(/^https:\/\/media\.example\.com\/td\/[\w-]+\.jpg$/);
      }
      await page.goto("/tours?provider=tiqets");
      await expect(page.locator(".mk-card").first()).toBeVisible();
      await expect(page.locator(".mk-card img")).toHaveCount(0);
      await expect(page.locator(".mk-card .mk-card-top .mk-badge").first()).toHaveText("Tiqets");
    });

    test("home and editorial rows: same sharp, bounded selection", async () => {
      // The rows load through the rate-limited public API (shared by every spec on this server);
      // the lowest and highest densities are enough to cover them.
      test.skip(!["desktop DPR1", "mobile DPR3"].includes(m.name), "rows are checked at the density extremes only");
      for (const path of ["/", "/experiences/danube"]) {
        await page.goto(path);
        const row = page.getByTestId("contextual-tours");
        await row.evaluate((el) => el.scrollIntoView());
        await expect(row.locator(".mk-card").first()).toBeVisible();
        const shots = await collect(page, '[data-testid="contextual-tours"]');
        for (const s of shots) assertSharp(s, path);
        // compact rows are below the fold: all lazy
        expect(shots.every((s) => s.loading === "lazy")).toBe(true);
      }
    });
  });
}
