# Phase 09.5 — Testing: Polish

## Goals
- Write Playwright e2e regression tests across all pages to confirm loading states, error states, and dark theme render correctly
- Verify responsive layout at key breakpoints

## Deliverables & Acceptance Criteria
- [ ] `frontend/tests/e2e/polish.spec.ts` — regression tests for loading, error, and theme
- [ ] E2E: Stock Chart page shows skeleton while data loads (before response arrives)
- [ ] E2E: Stock Chart page shows error alert with message for a failing API (mocked 500)
- [ ] E2E: Stock Chart error alert has a retry button; clicking it re-triggers the API call
- [ ] E2E: Stock Overview page shows error alert for failing API
- [ ] E2E: Symbol search shows "No results" for empty search response
- [ ] E2E: No light-mode white background is visible on any page in dark mode
- [ ] E2E: Chart page at 1280px has no horizontal scrollbar
- [ ] E2E: Overview page at 768px — table is present and horizontally scrollable if needed
- [ ] E2E: Navigation between all 3 pages works without full page reload (SPA navigation)
- [ ] All tests pass in CI

## Dependencies
- Phase 09 must be fully complete

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| test-plan.md | Detailed test cases |
| dependencies/requirements.md | Test tooling |
