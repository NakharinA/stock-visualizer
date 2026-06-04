# Phase 08.5 — Testing: Indicator Subpanel

## Goals
- Write Playwright e2e tests for subpanel tab switching and collapse/expand behavior
- Write Playwright component tests for `IndicatorPanel.vue`

## Deliverables & Acceptance Criteria
- [ ] `frontend/tests/e2e/indicator-subpanel.spec.ts` — e2e tests for all subpanel flows
- [ ] `frontend/tests/components/IndicatorPanel.spec.ts` — component tests
- [ ] E2E: Subpanel is not visible on page load (all indicators off by default)
- [ ] E2E: Enabling MACD makes the subpanel visible
- [ ] E2E: The active tab changes when a different tab is clicked
- [ ] E2E: Clicking an unchecked tab shows "Enable X" message instead of a chart
- [ ] E2E: Disabling the last enabled subpanel indicator hides the subpanel
- [ ] E2E: Main chart area is larger when subpanel is hidden than when it is visible
- [ ] E2E: Period switch preserves subpanel tab and indicator state
- [ ] Component: IndicatorPanel is not rendered when all `indicatorState` subpanel flags are false
- [ ] Component: Renders tab bar when at least one indicator is enabled
- [ ] Component: RSI tab click emits `update:activeTab` with `'rsi'`
- [ ] Component: Unchecked indicator tab shows enable-message placeholder
- [ ] All tests pass in CI

## Dependencies
- Phase 08 must be fully complete

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| test-plan.md | Detailed test cases |
| dependencies/requirements.md | Test tooling |
