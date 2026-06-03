# Phase 06 — Stock Chart: Subpanel Indicators

## Goals
- Build `IndicatorPanel.vue` as a tabbed subpanel below the main chart
- Render MACD, RSI, and Stochastic RSI each in their own Lightweight Charts sub-panel
- Implement collapse behavior: when all subpanel indicators are toggled off, the subpanel disappears and the main chart expands

## Deliverables & Acceptance Criteria

What we will have after this phase is complete:
- [ ] MACD tab renders a histogram + MACD line + signal line in the subpanel
- [ ] RSI tab renders a 0–100 line with 30 and 70 threshold lines
- [ ] Stoch RSI tab renders K and D lines (0–100)
- [ ] Tabs switch between indicators without re-fetching data
- [ ] Enabling MACD/RSI/StochRSI in `IndicatorToggle` makes the subpanel visible
- [ ] Disabling all three causes the subpanel to collapse (CSS height: 0 / v-if)
- [ ] Main chart expands to fill the full available height when subpanel is collapsed
- [ ] Active tab is preserved as the user enables/disables indicators

## Dependencies

What must be true before this phase starts:
- Phase 05 must be complete (chart page rendering, `IndicatorToggle.vue` exists with MACD/RSI/StochRSI checkboxes)
- Phase 03 must be complete (`indicators.macd`, `indicators.rsi`, `indicators.stoch_rsi` returned from backend)

## Files in This Phase

| File | Purpose |
|------|---------|
| README.md | This file |
| dependencies/requirements.md | No new packages |
| ui-flows.md | Subpanel layout, tab behavior, collapse flow |
| tasks.md | Granular implementation checklist |
