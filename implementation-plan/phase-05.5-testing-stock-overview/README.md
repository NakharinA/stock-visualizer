# Phase 05.5 — Testing: Stock Overview

## Goals
- Write Playwright e2e tests for all user flows on the `/overview` page
- Write Playwright component tests for `StockTable.vue`
- Verify localStorage persistence, add/remove flows, and row navigation

## Deliverables & Acceptance Criteria
- [ ] `frontend/tests/e2e/overview.spec.ts` — e2e tests for all 5 overview flows
- [ ] `frontend/tests/components/StockTable.spec.ts` — component tests for StockTable
- [ ] E2E: First visit populates default watchlist and displays ≥8 rows
- [ ] E2E: Add symbol flow adds a new row to the table and persists in localStorage
- [ ] E2E: Duplicate add shows warning without duplicating the row
- [ ] E2E: Remove symbol removes the row and updates localStorage
- [ ] E2E: Clicking a row navigates to `/stock/[symbol]`
- [ ] Component: StockTable renders correct number of rows from props
- [ ] Component: Positive diff_value rows have green text class applied
- [ ] Component: Negative diff_value rows have red text class applied
- [ ] Component: Remove button emits `remove` event with correct symbol
- [ ] Component: Row click emits `row-click` event with correct symbol
- [ ] Component: Remove button click does not emit `row-click`
- [ ] All tests pass in CI

## Dependencies
- Phase 05 must be fully complete
- Playwright configured in the Nuxt project

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — testing goals and acceptance criteria |
| test-plan.md | Detailed test cases and coverage map |
| dependencies/requirements.md | Test tooling and setup |
