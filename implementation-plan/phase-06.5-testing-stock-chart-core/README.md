# Phase 06.5 — Testing: Stock Chart Core

## Goals
- Write Playwright e2e tests for all chart page user flows
- Write Playwright component tests for `CandleChart.vue` and `SymbolSearch.vue`
- Verify chart renders, period switching, autocomplete, and default symbol redirect

## Deliverables & Acceptance Criteria
- [ ] `frontend/tests/e2e/stock-chart.spec.ts` — e2e tests for chart page flows
- [ ] `frontend/tests/components/SymbolSearch.spec.ts` — component tests for search bar
- [ ] E2E: Visiting `/stock` redirects to `/stock/AAPL`
- [ ] E2E: Chart renders (canvas element is present in DOM) for a valid symbol
- [ ] E2E: Switching time tabs triggers a new API call with the correct period
- [ ] E2E: Typing in search bar shows a dropdown with results
- [ ] E2E: Selecting a result navigates to the correct `/stock/[symbol]` URL
- [ ] E2E: Invalid symbol in URL shows an error message (no chart)
- [ ] Component: SymbolSearch shows results dropdown when `results` prop is non-empty
- [ ] Component: SymbolSearch emits `search` event with debounced query
- [ ] Component: SymbolSearch emits `select` event with symbol when result is clicked
- [ ] Component: SymbolSearch dropdown closes on Escape
- [ ] All tests pass in CI

## Dependencies
- Phase 06 must be fully complete

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — testing goals and acceptance criteria |
| test-plan.md | Detailed test cases |
| dependencies/requirements.md | Test tooling |
