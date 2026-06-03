# Phase 05 — Stock Chart: Core

## Goals
- Integrate Lightweight Charts and render OHLCV data as a candlestick series
- Enforce zoom-only behavior (disable horizontal scroll/pan)
- Add time window tab switcher (YTD / 1Y / 6M / 3M / 1M / 1W)
- Build symbol autocomplete search bar using the `/search` endpoint
- Handle the `/stock` empty state (no symbol in URL)
- Overlay EMA 20/50/100/200 lines on the main chart
- Add `IndicatorToggle.vue` with EMA checkboxes

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] `/stock/AAPL` renders a candlestick chart with real data
- [ ] Chart zooms with scroll wheel; horizontal pan is disabled
- [ ] Time tabs switch the period and reload chart data
- [ ] Symbol search bar shows autocomplete suggestions; selecting one navigates to `/stock/[symbol]`
- [ ] `/stock` (no symbol) shows an empty state with the search bar visible
- [ ] EMA 20/50/100/200 lines render on the chart
- [ ] IndicatorToggle checkboxes show/hide individual EMA lines
- [ ] Chart resizes correctly when the browser window is resized

## Dependencies

What must be true before this phase starts:
- Phase 01 must be complete (Nuxt app running)
- Phase 03 must be complete (`GET /stock/{symbol}` and `GET /search` endpoints working)
- `useStockApi.ts` stub exists with `getStock` and `searchSymbols` method signatures

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | lightweight-charts package, install command |
| ui-flows.md | Chart page layout, search bar flow, tab switching |
| context.md | Lightweight Charts API notes: zoom lock, series configuration, resize |
| tasks.md | Granular implementation checklist |
