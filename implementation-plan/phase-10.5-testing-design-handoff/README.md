# Phase 10.5 — Testing: Design Handoff Redesign

## Goal
Update the Playwright suite so it asserts the **new** UI from Phase 10 while keeping
the same behavioral coverage, and add coverage for the new Dashboard. The redesign
deliberately changed the UI contract the old specs encoded, so several specs must be
rewritten — not patched.

## What changed and how tests must adapt
| Old contract (pre-10) | New contract (Phase 10) | Action |
|---|---|---|
| Toggles are `role="checkbox"` (UCheckbox) | Switch toggles: `<button class="tog">` w/ `aria-pressed` + accessible name | Re-target via name + `aria-pressed`/`.on` class |
| Group headers "EMA Lines" / "Chart Overlays" / "Subpanel Indicators" | "Overlays" / "Oscillators" | Update text assertions |
| Label "Fair Value Gaps" | "Fair Value Gap" | Update text |
| All toggles off by default | ema20/ema50/SR/FVG/MACD **on** by default (persisted `sv.tog`) | Clear `sv.tog` in `beforeEach`; assert new defaults |
| Subpanel `.h-[140px]`, all 3 tabs always present + "Enable X" message | `.osc-wrap` (188px), only **enabled** tabs shown, active = `.osc-tab.active` | Rewrite subpanel specs |
| Overview = `UTable` | Hand-built table, rows still `tr[role="button"]`, remove still `aria-label="Remove"` | Mostly stable; verify selectors |

## Deliverables & Acceptance Criteria

### Backend
- [ ] `test_overview_endpoint.py`: assert new fields (`name`, `sector`, `volume`, `spark`) present; `spark` is a non-empty list of numbers; existing assertions still pass

### Shell / shared
- [ ] New `tests/e2e/shell.spec.ts`: sidebar nav (Dashboard/Chart/Watchlist) navigates; topbar search autocompletes and navigates to `/stock/{sym}`; index chips render

### Dashboard (new)
- [ ] New `tests/e2e/dashboard.spec.ts`: 4 index cards render and link to chart; watchlist grid reflects localStorage (incl. empty state); movers gainers/losers populated from mocked `/overview`

### Overview
- [ ] `tests/e2e/overview.spec.ts`: keep add/remove/persist/row-click/dup-warning/skeleton/error coverage against the new markup; add sort-by-column + quick-add-chip cases

### Chart overlays & toggle rail
- [ ] Rewrite `tests/components/IndicatorToggle.spec.ts` + `tests/e2e/chart-overlays.spec.ts` for switch toggles, new labels/groups, and default-on state; preserve independent-toggle + period-persistence coverage

### Subpanel
- [ ] Rewrite `tests/e2e/indicator-subpanel.spec.ts` + `tests/components/IndicatorPanel.spec.ts`: only-enabled-tabs, active-tab switching, collapse-when-all-off (chart expands), period persistence, value readouts

### Chart core & polish
- [ ] `tests/e2e/stock-chart.spec.ts`: redirect, canvas present, 6 period segments, period switch fires API, search nav, 404 error, loading skeleton — re-targeted to new header/segments
- [ ] `tests/e2e/polish.spec.ts`: loading/error/dark-theme/responsive checks updated to new layout

## Dependencies
- Phase 10 implemented.

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| test-plan.md | Per-spec checklist + selector reference |
| dependencies/requirements.md | No new packages |
</content>
