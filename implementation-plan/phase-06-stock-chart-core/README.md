# Phase 06 — Stock Chart Core

## Goals
- Integrate Lightweight Charts (TradingView) into the Nuxt frontend
- Build `CandleChart.vue` that renders OHLCV data as a candlestick series
- Configure chart to allow zoom only (disable horizontal pan/scroll)
- Add time window tab switcher (YTD / 1Y / 6M / 3M / 1M / 1W)
- Build symbol autocomplete search bar that calls `GET /search`
- Handle default symbol: redirect `/stock` → `/stock/AAPL`
- Fetch and display chart data via `useStockApi.ts`

## Deliverables & Acceptance Criteria
- [ ] `lightweight-charts` npm package installed
- [ ] `frontend/components/chart/CandleChart.vue` renders a candlestick chart from OHLCV data
- [ ] Chart horizontal panning is disabled; zooming (scroll wheel / pinch) is enabled
- [ ] Chart fills its container responsively (resizes with window)
- [ ] Time window tab switcher renders 6 tabs: YTD | 1Y | 6M | 3M | 1M | 1W
- [ ] Switching tabs re-fetches `/stock/[symbol]?period=...` and updates the chart
- [ ] Symbol search bar shows a dropdown of autocomplete results (from `GET /search?q=...`) as the user types
- [ ] Selecting an autocomplete result navigates to `/stock/[symbol]` for that ticker
- [ ] Visiting `/stock` with no symbol redirects to `/stock/AAPL`
- [ ] Visiting `/stock/TSLA` renders the chart for TSLA
- [ ] Loading state shown while chart data is fetching
- [ ] Error state shown if the API returns an error (e.g. invalid symbol in URL)

## Dependencies
- Phase 04 must be complete (`GET /stock/{symbol}` and `GET /search` working)
- Phase 03 must be complete (`useStockApi.ts` with `fetchStock` and `searchSymbols` implemented)
- Phase 02 must be complete (Nuxt layout scaffolded, `stock/[[symbol]].vue` exists)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| ui-flows.md | User flows for the stock chart page |
| tasks.md | Granular implementation checklist |
| context.md | Lightweight Charts API notes and gotchas |
| dependencies/requirements.md | Libraries and setup |
