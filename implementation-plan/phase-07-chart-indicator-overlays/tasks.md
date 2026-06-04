# Tasks — Phase 07

## composables/useIndicatorState.ts (new)

- [ ] Create `useIndicatorState()` composable returning a reactive `indicators` object:
  ```ts
  { ema20, ema50, ema100, ema200, macd, rsi, stochRsi, fibonacci, supportResistance, fvg }
  ```
  All booleans default to `false`

## components/chart/IndicatorToggle.vue

- [ ] Accept `modelValue: IndicatorState` prop and emit `update:modelValue`
- [ ] Render three labeled checkbox groups (see ui-flows.md for layout)
- [ ] Each checkbox is a `UCheckbox` bound to the corresponding key in `modelValue`
- [ ] Subpanel checkboxes (MACD, RSI, StochRSI) are rendered here but their effect is implemented in Phase 08

## components/chart/CandleChart.vue — EMA overlays

- [ ] Accept `indicators: IndicatorsData` prop (the full indicators object from StockResponse)
- [ ] Accept `indicatorState: IndicatorState` prop
- [ ] On mount, create (but do not set data for) all 4 EMA LineSeries instances
- [ ] Watch `indicatorState.ema20`: if true, call `ema20Series.setData(indicators.ema20)` and `applyOptions({ visible: true })`; if false, `applyOptions({ visible: false })`
- [ ] Repeat for ema50, ema100, ema200
- [ ] When `indicators` prop changes (period switch), re-call `setData()` for all visible EMA series

## components/chart/CandleChart.vue — Fibonacci overlays

- [ ] Store active Fibonacci price line refs in an array
- [ ] Watch `indicatorState.fibonacci`:
  - If true: create 7 price lines from `indicators.fibonacci.levels`, dashed style, gold color, titled with ratio string
  - If false: call `removePriceLine()` for each stored ref, clear array
- [ ] When `indicators` prop changes with fibonacci enabled, remove old lines and re-create from new data

## components/chart/CandleChart.vue — Support/Resistance overlays

- [ ] Store active S/R price line refs in an array
- [ ] Watch `indicatorState.supportResistance`:
  - If true: create one solid price line per level in `indicators.support_resistance`
  - If false: remove all stored price lines
- [ ] Re-create on data change when enabled

## components/chart/CandleChart.vue — FVG overlays

- [ ] Store active FVG price line pairs in an array
- [ ] Watch `indicatorState.fvg`:
  - If true: for each FVG in `indicators.fvg`, create two price lines (top and bottom) with green (bullish) or red (bearish) color
  - If false: remove all stored price lines
- [ ] Re-create on data change when enabled

## pages/stock/[[symbol]].vue

- [ ] Instantiate `useIndicatorState()` in the page
- [ ] Pass `indicators` and `indicatorState` as props to `<CandleChart>`
- [ ] Pass `indicatorState` as v-model to `<IndicatorToggle>`
- [ ] Place `<IndicatorToggle>` below the chart
