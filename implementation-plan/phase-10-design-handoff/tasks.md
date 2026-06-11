# Phase 10 — Tasks

Ordered so each step builds on the previous. Backend first (frontend depends on the
new fields), then design system + atoms, then shell, then pages.

## 1. Backend — extend `/overview`
- [ ] 1.1 `models/overview.py`: add `name: str`, `sector: str`, `volume: float`, `spark: list[float]` to `OverviewItem`
- [ ] 1.2 `services/yfinance.py` `fetch_overview`: fetch short daily history per symbol; derive `volume` (last bar) and `spark` (last ~30 closes); best-effort `name`/`sector` (try `.info`, fall back to symbol/""); keep `price`/`diff_value`/`diff_pct`
- [ ] 1.3 Verify `python -m pytest` backend suite still green (update expected schema test in 10.5 if needed)

## 2. Design system
- [ ] 2.1 `nuxt.config.ts`: add IBM Plex Sans/Mono `<link>` via `app.head`
- [ ] 2.2 `assets/css/main.css`: port prototype `:root` tokens + base + component CSS (sidebar, topbar, search, dashboard, overview, chart page, rail). Keep `@import "tailwindcss"` / `@import "@nuxt/ui"`

## 3. Shared atoms
- [ ] 3.1 `utils/format.ts` — `fmtPrice/fmtSigned/fmtPct/fmtCompact`
- [ ] 3.2 `components/ui/AppIcon.vue` — SVG path set
- [ ] 3.3 `components/ui/Sparkline.vue`
- [ ] 3.4 `components/ui/Delta.vue`
- [ ] 3.5 `utils/symbols.ts` — `INDEX_SYMBOLS` (SPY, QQQ) for chips, `DASHBOARD_INDICES` (SPY, QQQ, NVDA, AAPL), `MOVERS_UNIVERSE` (hardcoded large-caps)

## 4. Types & composables
- [ ] 4.1 `types/api.ts`: extend `OverviewItem` with `name/sector/volume/spark`
- [ ] 4.2 `composables/useIndicatorState.ts`: localStorage persistence + design default-on set (ema20/ema50/sr/fvg/macd) under key `sv.tog`
- [ ] 4.3 `useWatchlist.ts`: unchanged (key `stock-watchlist`); confirm default symbols

## 5. Shell
- [ ] 5.1 `components/TopbarSearch.vue` — autocomplete search → navigate
- [ ] 5.2 `layouts/default.vue` — sidebar rail + topbar (search + index chips) + content slot; fetch index chips via `/overview`

## 6. Dashboard
- [ ] 6.1 `pages/index.vue` — hero, index cards, watchlist grid, movers; fetch indices + universe via `/overview`

## 7. Overview
- [ ] 7.1 `components/overview/StockTable.vue` — hand-built sortable table (rows `tr[role="button"]`, remove `aria-label="Remove"`, Name/30D/Volume cols, delta pills, sort carets)
- [ ] 7.2 `pages/overview.vue` — header + add form (placeholder `Add symbol (e.g. NFLX)`, dup warning "Already in watchlist") + quick-add chips + table; keep skeleton + error markup hooks

## 8. Chart page
- [ ] 8.1 `utils/chartTheme.ts` — update palette to design tokens (transparent bg, Plex mono, accent)
- [ ] 8.2 `components/chart/CandleChart.vue` — restyle; add OHLC crosshair legend + EMA legend chips; switch FVG to canvas boxes synced on range/resize; keep EMA/fib/SR
- [ ] 8.3 `components/chart/IndicatorPanel.vue` — restyle subpanel (188px), show only enabled tabs, value readouts in bar, zoom sync with main chart
- [ ] 8.4 `components/chart/IndicatorToggle.vue` → right rail with switch toggles grouped Overlays/Oscillators (component renamed/kept as `IndicatorToggle`)
- [ ] 8.5 `pages/stock/[[symbol]].vue` — new header (star, sector, delta, segments, reset), wire rail into chart-body layout, last-viewed persistence

## 9. Verify
- [ ] 9.1 `cd frontend && npx nuxt typecheck` (or `vue-tsc`) clean
- [ ] 9.2 `npm run build` succeeds
- [ ] 9.3 Manual smoke (optional): dashboard, overview, chart render with live backend
- [ ] 9.4 Hand to Phase 10.5 for test rewrite
</content>
