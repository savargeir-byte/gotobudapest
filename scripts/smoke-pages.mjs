import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = 3891;
const base = `http://127.0.0.1:${port}`;
const server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(port) }
});
let output = "";
server.stdout.on("data", chunk => { output += chunk.toString(); });
server.stderr.on("data", chunk => { output += chunk.toString(); });

async function get(path) {
  const result = await fetch(base + path, { signal: AbortSignal.timeout(10000) });
  return { status: result.status, html: await result.text() };
}
async function ready() {
  for (let count = 0; count < 40; count++) {
    if (server.exitCode !== null) throw new Error("next start terminated: " + output);
    try { const result = await get("/"); if (result.status === 200) return; }
    catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for server: " + output);
}

const routes = [
  ["/", "A city worth"],
  ["/attractions", "100"],
  ["/guides", "A better city break"],
  ["/guides/buda-castle-district", "Fisherman"],
  ["/guides/downtown-pest-walking-guide", "Downtown Pest"],
  ["/guides/budapest-food-and-markets", "Food"],
  ["/neighbourhoods", "Budapest neighbourhoods"],
  ["/neighbourhoods/castle-district", "The Castle District"],
  ["/neighbourhoods/downtown-pest", "Downtown Pest"],
  ["/experiences", "Budapest experiences"],
  ["/experiences/danube", "Danube"],
  ["/experiences/thermal-baths", "Thermal baths"],
  ["/experiences/food-and-markets", "Food"],
  ["/essentials", "Budapest essentials"],
  ["/privacy", "Privacy information"]
];
try {
  await ready();
  for (const [path, expected] of routes) {
    const { status, html } = await get(path);
    assert.equal(status, 200, `${path} should return HTTP 200`);
    assert.ok(html.toLowerCase().includes(expected.toLowerCase()), `${path} missing expected content: ${expected}`);
    console.log(`PASS ${path} (${status})`);
  }
  const oldPlan = await get("/plan");
  assert.equal(oldPlan.status, 404, "/plan must not be a page");
  const home = await get("/");
  assert.ok(!home.html.includes("My trip") && !home.html.includes("Plan my trip"), "Old trip planner CTA still rendered");
  console.log("Route smoke tests passed, and Trip Planner is absent.");
} finally {
  server.kill("SIGTERM");
}
