# Phase 08 — Polish

## Goals
- Add loading states for chart data fetches and overview table
- Add error handling for failed API calls (bad symbol, network errors, empty data)
- Verify dark theme consistency across all pages and components
- Check responsive layout on narrower viewports

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] Chart page shows a spinner/skeleton while data is loading on first render and period switches
- [ ] Overview page shows skeleton rows while data is loading
- [ ] Navigating to `/stock/INVALIDXYZ` shows a user-visible error message (not a blank chart)
- [ ] Network error (backend down) shows a toast or alert rather than a silent failure
- [ ] Adding an unrecognized symbol to the watchlist shows a subtle warning (symbol not found)
- [ ] All pages use consistent dark background and text colors (no flash of white)
- [ ] Sidebar, table, chart, and subpanel all render without layout breaks at 1280px and 1440px

## Dependencies

What must be true before this phase starts:
- Phases 01–07 all complete (full app functional)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | No new packages |
| tasks.md | Checklist of polish items per page/component |
