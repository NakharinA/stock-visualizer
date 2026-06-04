# Phase 07.5 — Testing: Chart Indicator Overlays

## Goals
- Write Playwright e2e tests for toggle panel interactions and overlay visibility
- Write Playwright component tests for `IndicatorToggle.vue`

## Deliverables & Acceptance Criteria
- [ ] `frontend/tests/e2e/chart-overlays.spec.ts` — e2e tests for overlay toggle flows
- [ ] `frontend/tests/components/IndicatorToggle.spec.ts` — component tests for toggle panel
- [ ] E2E: Checking EMA 20 adds a line element to the chart area (DOM query for LineSeries canvas layer)
- [ ] E2E: Unchecking EMA 20 removes the visible line
- [ ] E2E: Enabling Fibonacci shows price line labels with ratio text (0.5, 0.618, etc.)
- [ ] E2E: Enabling S/R shows horizontal price lines in the chart
- [ ] E2E: Enabling FVG shows price line pairs (top/bottom of gap)
- [ ] E2E: Switching period with overlays enabled re-applies overlays after data reloads
- [ ] E2E: All indicators can be toggled independently without affecting each other
- [ ] Component: IndicatorToggle renders all 10 checkboxes
- [ ] Component: Checking EMA 50 emits `update:modelValue` with `ema50: true`
- [ ] Component: All checkboxes start unchecked (default state)
- [ ] All tests pass in CI

## Dependencies
- Phase 07 must be fully complete

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| test-plan.md | Detailed test cases |
| dependencies/requirements.md | Test tooling |
