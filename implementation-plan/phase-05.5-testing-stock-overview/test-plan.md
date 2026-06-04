# Test Plan — Phase 05.5: Stock Overview

## Frontend — Playwright E2E (`overview.spec.ts`)

Mock `GET /api/overview` with a fixed response to avoid live network calls.

### E2E Tests

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| First visit, default watchlist | Navigate to /overview with empty localStorage | Table shows 8 default symbols; localStorage contains `stock-watchlist` with default list |
| Returning visit | Navigate to /overview with existing localStorage watchlist | Table shows saved symbols, not default list |
| Add new symbol | Type "NFLX" in input, click Add | NFLX row appears in table; localStorage contains "NFLX" |
| Add duplicate symbol | Type "AAPL" (already in list), click Add | Warning message visible; still only one AAPL row; localStorage unchanged |
| Remove symbol | Click × on TSLA row | TSLA row disappears immediately; localStorage no longer contains "TSLA" |
| Row navigation | Click on NVDA row | Browser navigates to `/stock/NVDA` |
| Remove does not navigate | Click × on AAPL row | Page stays on /overview (no navigation) |
| Loading state | Delay mocked API response by 500ms | Skeleton rows visible during load |
| Error state | Mock API to return 500 | Error message visible; no table rows |

---

## Frontend — Playwright Component Tests (`StockTable.spec.ts`)

Mount `StockTable.vue` in isolation with test props.

### Component Tests

| Component | Scenario | Expected Behavior |
|-----------|----------|-------------------|
| StockTable | Renders correct row count | Given 3 OverviewItems as props → 3 table rows |
| StockTable | Positive diff_value | Row with `diff_value: 2.3` has green color class on Change cells |
| StockTable | Negative diff_value | Row with `diff_value: -4.2` has red color class on Change cells |
| StockTable | Zero diff_value | Row with `diff_value: 0` has neither green nor red class |
| StockTable | Price formatting | `price: 189.5` displayed as `$189.50` |
| StockTable | Change formatting | `diff_value: 2.3` displayed as `+2.30` |
| StockTable | Change % formatting | `diff_pct: 1.23` displayed as `+1.23%` |
| StockTable | Negative formatting | `diff_value: -4.2` displayed as `-4.20` (not `+-4.20`) |
| StockTable | Remove button emits event | Click × on row 1 → `remove` event emitted with `"AAPL"` |
| StockTable | Row click emits event | Click row body → `row-click` emitted with row's symbol |
| StockTable | Remove stops propagation | Click × → only `remove` emitted, NOT `row-click` |
| StockTable | Loading skeleton | `loading: true` prop → skeleton rows visible, not real data |
