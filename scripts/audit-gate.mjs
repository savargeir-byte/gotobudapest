// Dependency audit gate. Fails on any high or critical advisory EXCEPT the ones
// recorded below after a documented risk decision (see SECURITY.md).
//
// braces <= 3.0.3 (GHSA-vfj7-8cjw-p6xm): stack-exhaustion DoS when expanding
// deeply nested brace patterns. No patched release exists. It is only reachable
// through build-time/CLI tooling (eslint-config-next -> fast-glob -> micromatch,
// and @sanity/cli -> @sanity/codegen -> chokidar/globby), never in the deployed
// site, and only with attacker-controlled glob patterns on a developer machine.
import { spawnSync } from "node:child_process";

const accepted = new Set(["GHSA-vfj7-8cjw-p6xm"]);
const run = spawnSync("npm audit --json", {
  encoding: "utf8",
  shell: true,
  maxBuffer: 64 * 1024 * 1024,
});
let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  console.error("npm audit did not return JSON (registry unreachable?).");
  process.exit(2);
}

const problems = new Set();
const acceptedHits = new Set();
for (const [name, v] of Object.entries(report.vulnerabilities ?? {})) {
  for (const via of v.via) {
    if (typeof via === "string") continue; // derived entry; the root advisory is listed itself
    if (!["high", "critical"].includes(via.severity)) continue;
    const id = (via.url ?? "").split("/").pop();
    if (accepted.has(id)) acceptedHits.add(`${name} ${id}`);
    else problems.add(`${name}: ${via.title} (${via.url}) [${via.severity}]`);
  }
}
const meta = report.metadata?.vulnerabilities ?? {};
console.log(
  `npm audit: ${meta.critical ?? 0} critical, ${meta.high ?? 0} high, ${meta.moderate ?? 0} moderate (counts include dependents of accepted advisories)`,
);
for (const a of acceptedHits) console.log(`accepted risk: ${a}`);
if (problems.size) {
  console.error("Unaccepted high/critical advisories:");
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log("Audit gate passed.");
