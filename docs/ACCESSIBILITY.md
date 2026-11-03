# Accessibility audit (T-009) — 2026-11-02

Tool: axe-core 4.14.0 (rules tagged WCAG 2.0, 2.1 and 2.2 A and AA plus best practice) run inside Playwright on the local production build, desktop (1440x900) and mobile
(Pixel 7), plus scripted keyboard, heading, dialog, label and reduced-motion checks. Specs: `e2e/accessibility.spec.ts` (15 templates, the not-found page and 4 behaviour
checks) and `e2e/accessibility-marketplace-ui.spec.ts` (`/tours` in 4 filter states, a Viator and a Tiqets product page, the date dialog; mocked providers). Helper:
`e2e/support/a11y.ts`. Budget enforced in CI: **no axe violation of any impact** on those templates.

## Findings and fixes

| # | Issue (rule) | Severity | Where | Fix | Verified |
| --- | --- | --- | --- | --- | --- |
| 1 | Links in running text and photo credits identified by colour alone (`link-in-text-block`) | serious | `/attractions` (catalog tip), attraction, guide and neighbourhood pages | underline for links inside `.catalog-tip`, `.photo-credit`, `.article-body` text, figure captions and source lists | axe: 0 on all templates |
| 2 | Stand-alone links smaller than the WCAG 2.2 24 px target (`target-size`) | serious | source and reference lists on guides, experiences, neighbourhoods, essentials | `inline-block`, min-height 24 px | axe: 0 |
| 3 | Heading levels skip h1 → h3 (`heading-order`) | moderate | `/attractions`, `/guides`; `/tours` on narrow screens | visually hidden `h2` ("Places", "Guides", "Tours and tickets") before the card grids | axe and the heading-outline test |
| 4 | A product card link's accessible name did not contain its visible text ("&" against "and", WCAG 2.5.3, `label-content-name-mismatch`) | serious | every product card on `/tours` | `aria-label` now starts with the visible words "View details & availability"; the arrow is `aria-hidden` | axe: 0 |
| 5 | The home search field had its own outline removed and showed no focus indicator | keyboard focus | `/` | the search pill shows the focus ring (`:focus-within`) | focus probe: ring found |
| 6 | The filter button group had a label but no role | best practice | `/attractions` | `role="group"` | axe and the labelled-control test |

## Checks that passed without a change

Contrast and image alternative text (axe, all tested templates); one h1 and no skipped levels on all templates; the skip link is the first Tab stop, appears on screen and moves
focus to `#place`; visible focus on the first 25 Tab stops of every template; the photo gallery dialog has a name, moves focus in, closes on Escape and returns focus to the photo
button; the mobile filter drawer traps focus and restores it (existing `marketplace-ui.spec.ts`); the date dialog; every filter and sort control is labelled; search results are announced
(`role="status"`); with `prefers-reduced-motion: reduce` no animation or transition exceeds 50 ms or 250 ms.

## Not done / limits

* No manual screen-reader pass (NVDA, VoiceOver, TalkBack) and no user test with assistive technology; automated rules find only part of the WCAG problems.
* axe "incomplete" items (for example contrast over photographs such as the hero text) were not reviewed one by one.
* Touch targets: the 24 px WCAG 2.2 minimum is enforced; the 44 px recommendation is only met where the stylesheet already had it.
* The live site was not scanned in a browser (blocked from this machine); the audit ran on the identical production build locally.
* Templates not in the list (other attraction and guide variants, further `/experiences` and `/neighbourhoods` pages, legal pages) share components with the tested ones but were not scanned.

## Phase 20 follow-up (2026-11-03)

* Hero text contrast over the photograph, measured with pixels (text hidden, hero photographed, pixels under each text extent compared with the text colour): desktop 0 % below the WCAG need; phones had 12.9 % (eyebrow) and 23 % (intro line)
  below 4.5:1, fixed by a deeper phone shade (now 0 %). A test keeps it under 2 %.
* Escape now closes the open phone menu and returns focus to the menu button; the hamburger glyph is decorative.
* axe "incomplete" items reviewed on 7 templates, desktop and mobile: `color-contrast` over images and gradients (hero measured, card tags have an 80 % opaque dark background, gallery icon decorative) and
  `label-content-name-mismatch` on icon-only buttons (menu fixed; gallery glyphs `aria-hidden`).
* Still not done: NVDA, VoiceOver and TalkBack testing. No claim of complete WCAG conformance is made. Details: `docs/PHASE20-QA.md`.
