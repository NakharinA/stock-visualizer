# Test Plan — Phase 06.5: Stock Chart Core

## Frontend — Playwright E2E (`stock-chart.spec.ts`)

Use `page.route()` to intercept `/api/stock/**` and `/api/search` calls and return mock data.

### E2E Tests

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Default redirect | Navigate to `/stock` | URL changes to `/stock/AAPL` |
| Valid symbol renders | Navigate to `/stock/AAPL` | `<canvas>` element visible; no error message |
| Chart container has dimensions | Navigate to `/stock/AAPL` | Chart container has `clientWidth > 0` and `clientHeight > 0` |
| Default tab active | Navigate to `/stock/AAPL` | `3M` tab is visually active |
| Period switch | Click `1Y` tab | New API request made to `/api/stock/AAPL?period=1y` |
| Tab becomes active | Click `6M` tab | `6M` tab gains active styling; `3M` tab loses it |
| All 6 tabs present | Navigate to `/stock/AAPL` | Tabs YTD, 1Y, 6M, 3M, 1M, 1W are all visible |
| Search shows results | Type "nvid" in search bar | Dropdown appears with at least one result |
| Search navigation | Type "nvid", click NVDA result | URL changes to `/stock/NVDA` |
| Invalid symbol error | Navigate to `/stock/XXXXINVALID` (mock API returns 404) | Error message visible; no canvas element |
| Loading state | Delay mock response by 300ms | Loading indicator visible while request in flight |

---

## Frontend — Playwright Component Tests (`SymbolSearch.spec.ts`)

| Component | Scenario | Expected Behavior |
|-----------|----------|-------------------|
| SymbolSearch | Empty results | No dropdown rendered |
| SymbolSearch | Non-empty results prop | Dropdown visible with result items |
| SymbolSearch | Item format | Each item shows "SYMBOL — Name" |
| SymbolSearch | Select emits event | Click item → `select` emitted with correct symbol string |
| SymbolSearch | Debounced search | Type characters → `search` event not emitted immediately; emitted after 300ms |
| SymbolSearch | Escape closes | Press Escape key → dropdown closes |
| SymbolSearch | Click outside closes | Click outside dropdown → dropdown closes |
| SymbolSearch | Shows current symbol | Initial `currentSymbol` prop value shown in input when not focused |
