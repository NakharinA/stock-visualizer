# Tasks — Phase 08

## Loading States

- [ ] `pages/stock/[symbol].vue`: show a centered spinner while `loading === true`; replace chart area (do not overlay on top of stale chart)
- [ ] `pages/stock/[symbol].vue`: when switching time tabs, show a brief loading state before re-rendering chart
- [ ] `pages/overview.vue`: render 5 `<USkeleton>` rows while `loading === true`
- [ ] `components/chart/SymbolSearch.vue`: show a small spinner in the dropdown while autocomplete is in-flight

## Error Handling

- [ ] `pages/stock/[symbol].vue`: if `getStock` throws (404 or network error), show a `<UAlert>` with message "Symbol not found or data unavailable." Clear the chart area.
- [ ] `pages/overview.vue`: if `getOverview` throws, show a `<UAlert>` at the top of the page. Do not clear the table — keep stale data visible if available.
- [ ] `composables/useStockApi.ts`: wrap all `$fetch` calls in try/catch; re-throw with a typed error or return `null` + set an error string
- [ ] When adding a symbol to the watchlist that returns no data from `/overview`, show a `useToast()` warning: "Symbol '[X]' was added but returned no data."

## Dark Theme Consistency

- [ ] Verify `nuxt.config.ts` has `colorMode.preference: 'dark'` and `colorMode.fallback: 'dark'`
- [ ] Check that Lightweight Charts chart background matches the page background (`#0f172a` or whatever the dark bg is)
- [ ] Confirm subpanel charts use the same background/grid colors as the main chart
- [ ] Inspect sidebar, table headers, and inputs — no light-mode flicker on hard refresh

## Responsive Layout

- [ ] Test at 1280px: sidebar + chart visible without horizontal scroll
- [ ] Test at 1440px: chart uses available width; no awkward whitespace
- [ ] Ensure `IndicatorToggle` wraps gracefully if viewport is narrow
- [ ] Ensure the symbol search dropdown doesn't overflow the viewport edge

## Final Smoke Test

- [ ] Load `/` — blank dashboard loads, nav works
- [ ] Load `/overview` — table loads, add/remove/navigate all work
- [ ] Load `/stock/AAPL?period=1y` — chart loads, all toggles work end-to-end
- [ ] Disable network (DevTools → Offline) — error states shown gracefully
- [ ] Re-enable network — app recovers on next user action
