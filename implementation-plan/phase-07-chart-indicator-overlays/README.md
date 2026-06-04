# Phase 07 — Chart Indicator Overlays

## Goals
- Build `IndicatorToggle.vue` — a panel of checkboxes controlling all indicator visibility
- Add EMA 20/50/100/200 as line series overlaid on the main candlestick chart
- Add Fibonacci retracement levels as horizontal price lines on the main chart
- Add Support/Resistance levels as horizontal price lines on the main chart
- Add Fair Value Gap (FVG) zones as semi-transparent rectangle overlays on the main chart
- Toggling indicators on/off updates the chart without re-fetching data

## Deliverables & Acceptance Criteria
- [ ] `frontend/components/chart/IndicatorToggle.vue` renders a panel with checkbox groups:
  - EMA group: EMA 20, EMA 50, EMA 100, EMA 200
  - Overlay group: Fibonacci, Support/Resistance, FVG
  - Subpanel group: MACD, RSI, Stoch RSI (toggles implemented here, subpanel built in Phase 08)
- [ ] Checking/unchecking EMA 20 shows/hides the EMA 20 line on the chart (no re-fetch)
- [ ] EMA lines use distinct colors: EMA 20 = blue, EMA 50 = orange, EMA 100 = purple, EMA 200 = red
- [ ] Fibonacci levels render as dashed horizontal price lines labeled with their ratio (0, 0.236, etc.)
- [ ] Support/Resistance levels render as solid horizontal lines in a neutral color (e.g. white/50% opacity)
- [ ] FVG zones render as semi-transparent rectangles: bullish = green (10% opacity), bearish = red (10% opacity)
- [ ] All overlays are off by default; user must enable them manually
- [ ] Toggle state is reactive: enabling/disabling an indicator adds/removes it from the chart immediately
- [ ] `CandleChart.vue` accepts all indicator data as props and exposes toggle state via emits or a shared composable

## Dependencies
- Phase 06 must be complete (candlestick chart is working, `CandleChart.vue` exists)
- Phase 04 must be complete (API returns indicator data including fibonacci, s/r, fvg)
- The `stockData` ref (StockResponse) from Phase 06 must be accessible to the new overlay components

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| ui-flows.md | Toggle panel interaction flows |
| tasks.md | Granular implementation checklist |
| context.md | Lightweight Charts overlay APIs for lines and rectangles |
| dependencies/requirements.md | No new packages; context notes |
