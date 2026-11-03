# Dependabot PR review (#12 - #19), savargeir-byte/gotobudapest

Reviewed locally on 2026-11-02 against origin/main d09dc7d. Main checkout untouched, nothing pushed or merged.
Local env: Node 24.22.0 / npm 11.19.1 (Windows). CI env: Node 22 / npm 10.x (ubuntu-latest). Baseline = origin/main in a clean worktree.

## Headline findings

1. **Root cause of the failed `build` and `verify` CI checks on #13, #14, #15 (and #17 too): the lockfile Dependabot generated is out of sync for npm 10.**
   `@sanity/cli` (pulled in by `sanity`) has `typescript@7.0.2` as an auto-installed peer. Main's lockfile contains `node_modules/@sanity/cli/node_modules/typescript` 7.0.2 plus 21 `@typescript/typescript-*` platform packages. Dependabot's regenerated lockfile drops all of them. CI runs Node 22 with npm 10.9, where `npm ci` then aborts:
   ```
   npm error `npm ci` can only install packages when your package.json and package-lock.json ... are in sync.
   npm error Missing: typescript@7.0.2 from lock file
   npm error Missing: @typescript/typescript-aix-ppc64@7.0.2 from lock file ...
   ```
   Reproduced with npm 10.9.9 on Node 22.23.4 (`npm ci --dry-run`): main passes; #13, #14, #15, #17 fail with exactly this error. npm 11 (local) is lenient, so `npm ci` succeeds locally. Every CI job starts with `npm ci`, so both `build` (verify.yml) and `verify` (security.yml) die at the install step; the code is not at fault.
   **Fix, tested:** start from main's lockfile, change package.json, regenerate with npm 10: `npm install --package-lock-only --ignore-scripts <pkg>@<ver>`. The result keeps the typescript 7 peer entries, `npm ci --dry-run` under npm 10 passes, and the lock diff is small. Ready patches are listed at the end. `@dependabot rebase` will probably not help, because Dependabot would regenerate the same pruned lock.
   Note: the same mismatch will recur for every future Dependabot npm PR until main's lock and Dependabot's resolver agree. Options: keep merging hand-regenerated PRs, or add `typescript` as an explicit direct dependency range that satisfies `@sanity/cli`'s peer (not tested).

2. Apart from the lockfile problem, **#13, #14, #15 and #17 pass every local check** (tsc, eslint, 137/137 unit tests, `next build`, `audit:gate`). #19 (TypeScript 7) breaks ESLint.

3. Merging the three GitHub-Actions PRs one by one will conflict: they edit adjacent lines (`uses: actions/checkout` and `uses: actions/setup-node`) in 5 workflow files (verified with a local merge: CONFLICT in attraction-galleries, attraction-histories, editorial-photography, security, verify). One combined PR avoids this.

## Result matrix (all npm PRs merged with origin/main first where base was old; #14 and #17 already on d09dc7d)

| Check | main (baseline) | #14 next 16.4.3 | #13 next-sanity 13.4.0 | #15 @types/node 26 | #17 eslint 10 | #19 typescript 7 |
|---|---|---|---|---|---|---|
| `npm ci` (npm 11 / Node 24) | OK | OK | OK | OK | OK (peer warnings) | OK (peer warnings) |
| `npm ci` (npm 10 / Node 22, = CI) | OK | **FAIL** (lock) | **FAIL** (lock) | **FAIL** (lock) | **FAIL** (lock) | OK |
| `npx tsc --noEmit` | OK | OK | OK | OK | OK | OK |
| `npx eslint .` | OK (0 warn) | OK | OK | OK | OK (0 warn, same 163 files) | **FAIL** (crash) |
| unit tests (tests/*.test.ts[x]) | 137/137 | 137/137 | 137/137 | 137/137 | 137/137 | 137/137 |
| `next build` | OK | OK | OK | OK | OK | OK |
| `npm run audit:gate` | pass (29 moderate) | pass | pass | pass | pass (28 moderate) | not run |
| `npm ls` | exit 0 | exit 0 | exit 0 | exit 0 | exit 0 but `invalid` peers (see) | exit 0 but `invalid` peers (see) |

Playwright was not run (ports used by the other session). The 10 EBUSY lines in the #14 build log ("Failed to update prerender cache ... EBUSY") are a Windows file-lock artefact of three builds running at the same time; the build exit code is 0 and the other builds show none.

## #14 next + eslint-config-next 16.4.2 -> 16.4.3 (group next-react)

- package.json: `"next": "16.4.2"` -> `"16.4.3"` (exact pin kept), `"eslint-config-next": "^16.4.2"` -> `"^16.4.3"`.
- Release notes v16.4.3 (backport release, lts-active): fixed extensionless Google font URLs in both bundlers; `proxy.ts` no longer loads the app-page runtime; reverted a Turbopack "loader change invalidation" change; OpenTelemetry request traces kept together; server bootstrap no longer loads standalone React; CI-only items. No breaking changes, nothing for eslint-config-next. We use Turbopack build, and the build and routes are identical to baseline.
- Peers: eslint-config-next 16.4.3 peer `eslint >=9.0.0`, `typescript >=3.3.1`; no conflict.
- Local: all green. CI: failed because of the lockfile problem above (not the code).
- Fix: `fix-pr14-next.patch` (package.json + lock, 50 insertions / 50 deletions, npm 10 `ci` OK).
- **Recommendation: UPDATE (lockfile only), then MERGE.** Safe patch release.

## #13 next-sanity 13.3.4 -> 13.4.0 (group sanity)

- package.json: `"next-sanity": "^13.3.4"` -> `"^13.4.0"`.
- Changelog 13.4.0 (minor): `sanityFetch` / `usePresentationQuery` infer types from branded `.groq` imports (experimental; needs TS 7.1 + `contentMappers`, i.e. opt-in, we do not use it). Patch: Sanity monorepo to 6.12.0, `@sanity/client` dep `^7.28.0`, `styled-components ^6.6.0`, `@sanity/visual-editing ^6.2.0`. Peer deps of 13.4.0: `next ^16.0.0-0`, `react/react-dom ^19.2.3`, `sanity ^5.29.0 || ^6.0.0`, `@sanity/client ^7.28.0 || ^8.11.0` (was `^7.26.2 || ^8.0.0`), `styled-components ^6.1`. Nothing labelled breaking.
- Peer check: we resolve `@sanity/client` 8.11.0 (lock) which satisfies the new `^8.11.0` floor; package.json still says `^8.10.1`, so a fresh install without lock could in theory pick 8.10.x and warn. Optional follow-up: bump to `"@sanity/client": "^8.11.0"` in the same PR (not tested, trivially safe). `npm ls` clean.
- Local: all green. CI failed because of the lockfile problem.
- Fix: `fix-pr13-next-sanity.patch` (21+/21-, npm 10 `ci` OK).
- **Recommendation: UPDATE (lockfile only), then MERGE.** Group with #14 in one PR (both are the "Next/Sanity runtime" bump).

## #15 @types/node 22.20.5 -> 26.6.5

- package.json: `"@types/node": "^22.0.0"` -> `"^26.6.5"` (latest on npm is already 26.6.6).
- Release notes: only a DefinitelyTyped mirror, no changelog. Types track the Node.js API of that major.
- Local: tsc, eslint, tests, build all green with the new types, so it compiles. But: CI and the declared floor are Node 22 (`engines: >=22.12.0`, workflows use `node-version: 22`), while 26 typings advertise APIs that do not exist in Node 22 and can hide a runtime crash that the type checker would otherwise catch. Rule of thumb: `@types/node` major = the Node major you deploy on.
- CI failure: same lockfile problem (npm 10 `ci` fails).
- Fix if you still want it: `fix-pr15-types-node.patch` (9+/9-).
- **Recommendation: DEFER / close.** Keep `^22` (or move to `^24` together with the CI/Vercel Node version bump). Add to `.github/dependabot.yml`: `ignore: - dependency-name: "@types/node" update-types: ["version-update:semver-major"]`.

## #17 eslint 9.39.5 -> 10.14.0

- package.json: `"eslint": "^9.39.5"` -> `"^10.14.0"`. (Branch name says 10.13.0, PR title and package.json say 10.14.0.)
- ESLint 10 migration guide (relevant parts): Node >= 20.19 / 22.13 / 24 (we are fine), eslintrc fully removed (we use flat `eslint.config.mjs`), config lookup starts from each file's directory (single root config here), three more rules in `eslint:recommended`, JSX identifiers tracked as references, rule-API removals for plugin authors (`context.getFilename()` etc.).
- Local result: `npx eslint .` exit 0, 163 files, 0 errors, 0 warnings, identical to baseline; a deliberately bad file still triggers `react-hooks/rules-of-hooks`, `@typescript-eslint/no-explicit-any`, `@next/next/no-img-element`, `jsx-a11y/alt-text`, so the plugins really work.
- Peer-dependency conflicts (real, but only warnings): `eslint-config-next@16.4.2/16.4.3` declares `eslint >=9.0.0`, but its bundled plugins cap the peer at ESLint 9: `eslint-plugin-react@7.37.5 (^9.7)`, `eslint-plugin-import@2.32.0 (^9)`, `eslint-plugin-jsx-a11y@6.10.2 (^9)`. `npm ls --all` marks eslint@10.14.0 as `invalid` for those three; npm only prints "ERESOLVE overriding peer dependency" warnings. Only `eslint-plugin-react-hooks@7.1.1` and the `eslint-config-next` peer list ESLint 10. It works today, but it is an unsupported combination that can break on any plugin patch.
- CI failure: lockfile problem. Fix: `fix-pr17-eslint.patch` (npm 10 `ci` OK).
- **Recommendation: DEFER.** Wait until `eslint-plugin-react`, `-import`, `-jsx-a11y` (via a new eslint-config-next) declare ESLint 10 support; nothing is gained from ESLint 10 for this repo. If merged anyway, the lock must come from the patch.

## #19 typescript 5.9.3 -> 7.0.2

- package.json: `"typescript": "^5.9.3"` -> `"^7.0.2"`. (This PR also has an old base; I merged main into it first.)
- TypeScript 7.0 (native Go compiler, announced 2026-06-18): no programmatic JS API (7.1 is expected to add one); hard errors for removed options (`baseUrl`, `moduleResolution node10`, `target es5`, ...); changed defaults (`strict: true`, `types: []`, `rootDir` = `./`, `module: esnext`). Tooling that needs the compiler API (typescript-eslint etc.) is told to use the TS 6 API through the alias `@typescript/typescript6`.
- Local: `npx tsc --noEmit` OK (our tsconfig has no removed options), a deliberately wrong file is caught by both `tsc` and `next build` (Next 16.4.2 type-checks fine with TS 7), 137/137 tests, `next build` OK.
- **Fails: `npx eslint .` exit 2:**
  ```
  Error: typescript-eslint does not support TS 7.0.
  Please see https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0 ...
      at ...\node_modules\eslint-config-next\node_modules\typescript-eslint\dist\index.js:52:11
  ```
  `typescript-eslint@8.72.x` (peer `typescript >=4.8.4 <6.1.0`) is pulled in by eslint-config-next, and `npm ls` flags typescript@7.0.2 as `invalid` for it. In CI `npm run lint` would fail (its `npm ci` passes, because the lock keeps typescript 7 at root).
- Tested workaround (side-by-side install, per the TS 7 announcement), package.json:
  ```
  "typescript": "npm:@typescript/typescript6@^6.0.2",
  "@typescript/native": "npm:typescript@^7.0.2"
  ```
  Result: `npx tsc -v` = 7.0.2, tsc OK, eslint exit 0, `next build` OK (Next/typescript-eslint use the TS 6 API, `tsc` is the native 7 binary). `npm ci` under npm 10 works when the lock is generated with npm 10. Patch: `workaround-pr19-ts7-alias.patch` (package.json only; lock must be regenerated with npm 10).
- Risk: this is a two-compiler setup, editors (VS Code, Next language service) and typescript-eslint on 6.x vs `tsc` on 7.x can disagree; the gain (faster `tsc`) is small for a 163-file project.
- **Recommendation: DEFER** until typescript-eslint / eslint-config-next support TS >= 7.1 (tracking: typescript-eslint issue 10940). Add a dependabot `ignore` for `typescript` major updates meanwhile.

## #12 actions/checkout v4 -> v7

- Diff: 8 workflows, `uses: actions/checkout@v4` -> `@v7`, nothing else. Coverage: 8 of 8 uses in `.github/workflows` (attraction-galleries, attraction-histories, booking-partners, codeql, editorial-photography, sanity-seed, security, verify).
- Breaking changes across v5-v7: v5 moved to the node24 runtime (runner >= 2.327.1, ubuntu-latest hosted runners are fine); v6 stores `persist-credentials` in a file under `$RUNNER_TEMP` instead of `.git/config` (only matters for Docker container actions needing runner >= 2.329.0; we have none; booking-partners and sanity-seed set `persist-credentials: false`, still valid); v7 refuses to check out fork PR code under `pull_request_target` / `workflow_run` unless `allow-unsafe-pr-checkout: true`.
- Our triggers: only `push`, `pull_request`, `schedule`, `workflow_dispatch`. No `pull_request_target`, no `workflow_run`, no `ref:`/`repository:` inputs (grep verified), so none of the breaking changes apply.
- Conflict note: merges cleanly alone, conflicts after #18 is merged (adjacent lines).
- **Recommendation: MERGE, as part of the combined Actions PR.**

## #18 actions/setup-node v4 -> v7

- Diff: 7 workflows, `@v4` -> `@v7`. Coverage: 7 of 7 uses (checkout is used in codeql which has no setup-node: correct).
- Breaking changes: v5 node24 runtime and automatic caching when `packageManager` is set (we always set `cache: npm` explicitly, `package.json` has no `packageManager`); v6 `always-auth` input removed (grep: not used) and auto-cache limited to npm; v7 ESM migration and removal of the dummy `NODE_AUTH_TOKEN` (only matters with `registry-url`, grep: not used). `node-version: 22` inputs stay valid.
- **Recommendation: MERGE, as part of the combined Actions PR.**

## #16 github/codeql-action v3 -> v4

- Diff: only `codeql.yml`, `init@v3` -> `init@v4`, `analyze@v3` -> `analyze@v4`. Coverage: 2 of 2 (no `autobuild`, no `upload-sarif` used). The PR body only shows v3.x release notes; the relevant v4 facts: released 2025-10-07, node24 runtime, same inputs (`languages: javascript-typescript`, `category: /language:javascript-typescript` unchanged), v3 is deprecated in December 2026 (GitHub changelog), i.e. this bump is due now. Workflow permissions (`contents: read`, `security-events: write`) are what v4 needs. Triggers are push / pull_request / schedule, no forks-with-secrets pattern.
- **Recommendation: MERGE, as part of the combined Actions PR.** After the first run check that the code-scanning result still appears under the same category.

## Recommended grouping

1. **One "ci: bump actions" PR** = #12 + #16 + #18 (patch `combined-actions.patch`: 8 files, 17+/17-; applying all three with a plain sed on main verified: 8x checkout@v7, 7x setup-node@v7, codeql init/analyze @v4, no other changes). Close the three Dependabot PRs after merging. Low risk.
2. **One "deps: next 16.4.3 + next-sanity 13.4.0" PR** = #14 + #13 with a lockfile regenerated by npm 10 from main (apply `fix-pr14-next.patch`, then the next-sanity bump; or run `npm install --package-lock-only --ignore-scripts next@16.4.3 eslint-config-next@^16.4.3 next-sanity@^13.4.0` with npm 10 on a branch from main, keep `next` pinned exact). Verify `npm ci` with Node 22 before merging.
3. **Defer / ignore:** #15 (@types/node 26, mismatch with Node 22), #17 (eslint 10, plugin peers cap at ESLint 9), #19 (TypeScript 7, typescript-eslint unsupported). Close them and add `ignore` rules for major versions of `@types/node`, `eslint`, `typescript` in `.github/dependabot.yml`; revisit when eslint-config-next ships ESLint 10 / TS 7.1 support.

## Verdict per PR

| PR | Change | Verdict |
|---|---|---|
| #12 | actions/checkout 4 -> 7 | MERGE (in combined Actions PR) |
| #13 | next-sanity 13.3.4 -> 13.4.0 | UPDATE (npm-10 lockfile), then MERGE, group with #14 |
| #14 | next + eslint-config-next 16.4.2 -> 16.4.3 | UPDATE (npm-10 lockfile), then MERGE |
| #15 | @types/node 22 -> 26.6.5 | DEFER (match Node 22 runtime; ignore majors) |
| #16 | codeql-action 3 -> 4 | MERGE (in combined Actions PR) |
| #17 | eslint 9.39.5 -> 10.14.0 | DEFER (plugin peers cap at ESLint 9; works but unsupported) |
| #18 | actions/setup-node 4 -> 7 | MERGE (in combined Actions PR) |
| #19 | typescript 5.9.3 -> 7.0.2 | DEFER (typescript-eslint crashes; alias workaround exists but is a two-compiler setup) |

## Artifacts (scratchpad `.../scratchpad/dep/`)

- `fix-pr14-next.patch`, `fix-pr13-next-sanity.patch`, `fix-pr15-types-node.patch`, `fix-pr17-eslint.patch`: package.json + package-lock.json against main d09dc7d, generated with npm 10.9.9 on Node 22.23.4 (`git apply`-able; each verified with `npm ci --dry-run` under npm 10). They each apply to main separately; for the combined PR regenerate in one go rather than stacking patches.
- `combined-actions.patch`: the three Actions bumps in one diff.
- `workaround-pr19-ts7-alias.patch`: package.json alias workaround for TypeScript 7.
- All worktrees (`gb-dep-*`), logs and the Node 22 toolchain were removed afterwards.

## Outcome (Phase 19, 2026-11-02)

The scratchpad patches named above are not kept in the repository. The recommendations were carried out as two focused branches (no pull requests exist yet, the assistant cannot open them):

* `chore/actions-bump-phase19` — the combined Actions change (`docs/phase19/combined-actions.patch` holds the diff) plus Dependabot `ignore` rules for typescript 7, eslint 10 and @types/node 26.
* `chore/next-16.4.3-next-sanity-13.4.0` — Next 16.4.3, eslint-config-next 16.4.3 and next-sanity 13.4.0 with a lock file regenerated by npm 10.9.9; npm 10 `ci --dry-run` passes; typecheck, lint, 137 unit tests, production build and the full Playwright run (528 passed, 49 skipped) pass.

Deferred: #19 (typescript 7), #17 (eslint 10), #15 (@types/node 26). Dependabot PRs #12-#19 are closed by the owner once the two branches are merged.
