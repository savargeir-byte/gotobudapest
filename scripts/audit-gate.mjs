// Dependency audit gate. Fails on any high or critical advisory EXCEPT the ones
// recorded below after a documented risk decision (see SECURITY.md).
//
// Add an advisory id to `accepted` ONLY together with a written risk decision in
// SECURITY.md (package, reachability, real impact). Currently nothing is accepted.
import { spawnSync } from "node:child_process";

const accepted = new Set([]);
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
