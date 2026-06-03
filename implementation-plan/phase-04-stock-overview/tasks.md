# Tasks — Phase 04

## composables/useWatchlist.ts

- [ ] Create `useWatchlist.ts` with `symbols` ref, `add()`, `remove()`, `loadFromStorage()`
- [ ] Initialize from localStorage; fall back to `DEFAULT_SYMBOLS` if key absent
- [ ] `add()` uppercases and deduplicates before saving
- [ ] `remove()` filters and saves

## composables/useStockApi.ts

- [ ] Implement `getOverview(symbols: string[]) -> OverviewItem[]`
  - Build query string: `symbols.join(',')`
  - `$fetch('http://localhost:8000/overview?symbols=...')`
  - Return typed array
- [ ] Define TypeScript types: `OverviewItem { symbol, price, diff_value, diff_pct }`

## components/overview/StockTable.vue

- [ ] Accept `rows: OverviewItem[]` as a prop
- [ ] Render table with columns: Symbol, Price, Change ($), Change (%)
- [ ] Color-code Change columns: green if positive, red if negative
- [ ] Emit `remove(symbol)` when ✕ button clicked
- [ ] Emit `select(symbol)` when row body clicked

## pages/overview.vue

- [ ] Use `useWatchlist()` to get `symbols`
- [ ] On mount: call `getOverview(symbols.value)` and store result
- [ ] Render `<StockTable>` with the result
- [ ] Handle `@remove` event: call `watchlist.remove(symbol)` and re-fetch
- [ ] Handle `@select` event: `navigateTo('/stock/' + symbol)`
- [ ] Add symbol input + "Add" button above table
  - On submit: call `watchlist.add(symbol)` then re-fetch overview
- [ ] Show loading state while fetching

## Verification

- [ ] Visit `/overview` — table shows default symbols with prices
- [ ] Add a new valid symbol (e.g. AMZN if not in default list) — appears in table
- [ ] Add a duplicate — not added twice
- [ ] Remove a symbol — disappears from table; gone after refresh
- [ ] Refresh the page — watchlist is preserved
- [ ] Click a row — navigates to `/stock/[symbol]`
