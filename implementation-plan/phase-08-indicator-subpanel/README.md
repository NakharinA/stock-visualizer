# Phase 08 — Indicator Subpanel

## Goals
- Build `IndicatorPanel.vue` — a tabbed subpanel below the main chart for MACD, RSI, and Stochastic RSI
- Each tab renders its own Lightweight Charts instance (separate chart for the oscillator)
- Implement collapse behavior: when no subpanel indicators are enabled in `IndicatorToggle`, the subpanel hides and the main chart expands to fill the full height

## Deliverables & Acceptance Criteria
- [ ] `frontend/components/chart/IndicatorPanel.vue` renders with 3 tabs: MACD | RSI | Stoch RSI
- [ ] MACD tab: renders MACD line, signal line, and histogram bars in a subpanel chart (~20-22vh tall)
- [ ] RSI tab: renders RSI line with overbought (70) and oversold (30) horizontal reference lines
- [ ] Stoch RSI tab: renders K line and D line
- [ ] Only the active tab's chart is visible; switching tabs shows the correct chart
- [ ] When all three subpanel toggles (MACD, RSI, Stoch RSI) are unchecked in `IndicatorToggle`, the subpanel is hidden entirely
- [ ] When the subpanel is hidden, the main `CandleChart` expands to fill the full available viewport height
- [ ] When at least one subpanel toggle is enabled, the subpanel is visible and the main chart returns to ~75-80vh
- [ ] The tab bar is only visible when the subpanel is shown
- [ ] Switching from the active tab to an unchecked indicator (e.g. RSI is unchecked but its tab is clicked) does not display data — show "Enable RSI in the indicator panel" message instead

## Dependencies
- Phase 07 must be complete (`IndicatorToggle.vue` with subpanel checkboxes, `useIndicatorState` composable)
- Phase 06 must be complete (main chart established, `CandleChart.vue` resizes on container change)
- Phase 04 must be complete (MACD, RSI, StochRSI data in `/stock` response)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| ui-flows.md | Subpanel interaction flows |
| tasks.md | Granular implementation checklist |
| dependencies/requirements.md | No new dependencies |
