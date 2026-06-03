# Phase 04 — Stock Overview Page

## Goals
- Build `StockTable.vue` and wire it to the real `/overview` backend endpoint
- Implement the localStorage watchlist (default symbols, add, remove, persist)
- Enable row click navigation to `/stock/[symbol]`
- Implement `getOverview` in `useStockApi.ts`

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] Navigating to `/overview` shows a table with columns: Symbol, Price, Change ($), Change (%)
- [ ] Table loads real price data from `GET /overview`
- [ ] Positive change shown in green; negative in red
- [ ] Default watchlist symbols are pre-populated on first visit
- [ ] User can type a symbol into an input and click "Add" to append it to the watchlist
- [ ] User can click a remove button per row to delete that symbol
- [ ] Watchlist survives a browser refresh (localStorage)
- [ ] Clicking a table row navigates to `/stock/[symbol]`

## Dependencies

What must be true before this phase starts:
- Phase 01 must be complete (Nuxt app running, `useStockApi.ts` stub exists)
- Phase 03 must be complete (`GET /overview` endpoint returns correct JSON)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | No new packages |
| ui-flows.md | Table layout, watchlist interactions |
| tasks.md | Granular implementation checklist |
