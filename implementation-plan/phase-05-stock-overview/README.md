# Phase 05 — Stock Overview Page

## Goals
- Build `StockTable.vue` displaying Symbol, Current Price, Diff Value, and Diff % columns
- Connect the table to `GET /overview` via `useStockApi.ts`
- Implement localStorage-backed watchlist: persist symbols, support add and remove
- Provide a default predefined watchlist for first-time users
- Make each row clickable — navigating to `/stock/[symbol]`

## Deliverables & Acceptance Criteria
- [ ] `frontend/components/overview/StockTable.vue` renders a Nuxt UI table with 4 columns: Symbol, Price, Change, Change %
- [ ] `frontend/pages/overview.vue` loads and displays the table with data from `/overview`
- [ ] Positive Diff Value/% shown in green; negative in red; zero in neutral color
- [ ] Clicking a table row navigates to `/stock/[symbol]`
- [ ] Add symbol input: text field + "Add" button adds a new symbol to the watchlist and triggers a re-fetch
- [ ] Remove button on each row removes the symbol from the watchlist and the table immediately
- [ ] Watchlist is persisted in `localStorage` under the key `stock-watchlist`
- [ ] On first load (empty localStorage), a default watchlist of at least 8 symbols is shown: `["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "SPY"]`
- [ ] Page shows a loading skeleton while data is fetching
- [ ] Page shows an error message if `/overview` returns an error

## Dependencies
- Phase 04 must be complete (GET /overview endpoint working)
- Phase 03 must be complete (`useStockApi.ts` composable skeleton exists)
- Phase 02 must be complete (Nuxt layout and pages scaffolded)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| ui-flows.md | User flows for the overview page |
| tasks.md | Granular implementation checklist |
| dependencies/requirements.md | Libraries and notes |
