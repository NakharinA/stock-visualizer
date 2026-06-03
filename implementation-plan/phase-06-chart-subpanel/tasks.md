# Tasks — Phase 06

## components/chart/IndicatorPanel.vue

- [ ] Accept props: `indicators: Indicators`, `ohlcv: OhlcvBar[]`, `activeTab: 'macd' | 'rsi' | 'stochRsi'`, `visible: boolean`
- [ ] Emit `update:activeTab` on tab click
- [ ] Render tab buttons: MACD / RSI / Stoch RSI
- [ ] Conditionally render each sub-chart based on `activeTab`
- [ ] Use `v-show` (not `v-if`) for sub-charts to preserve chart instances across tab switches

### MACD Sub-Chart

- [ ] Create Lightweight Charts chart instance with dark theme, height ~20vh
- [ ] Add `HistogramSeries` for histogram; color green when value ≥ 0, red when < 0
- [ ] Add `LineSeries` for MACD line (blue `#3b82f6`) and signal line (orange `#f97316`)
- [ ] Filter null values before `setData`
- [ ] Sync time scale with main chart (optional — skip for now)

### RSI Sub-Chart

- [ ] Create chart instance with fixed price scale: `minValue: 0, maxValue: 100`
- [ ] Add `LineSeries` for RSI (purple `#a855f7`)
- [ ] Add price lines for 30 and 70 with dashed style

### StochRSI Sub-Chart

- [ ] Create chart instance with fixed price scale: `minValue: 0, maxValue: 100`
- [ ] Add `LineSeries` for K (blue) and D (orange)
- [ ] Filter null values before `setData`

## pages/stock/[symbol].vue — Subpanel Integration

- [ ] Compute `showSubpanel = toggles.macd || toggles.rsi || toggles.stochRsi`
- [ ] Compute `availableTabs` = list of enabled oscillator keys
- [ ] Watch `showSubpanel`: when it becomes false, no action needed; when true, auto-select first available tab
- [ ] Watch `activeTab`: if current tab's indicator is disabled, switch to next available tab
- [ ] Pass `v-if="showSubpanel"` on `<IndicatorPanel>`
- [ ] Use CSS transition or Tailwind classes to smoothly resize main chart height

## Verification

- [ ] Open `/stock/AAPL` with MACD enabled → subpanel shows MACD
- [ ] Click RSI tab → RSI chart renders; 30/70 lines visible
- [ ] Click StochRSI tab → K and D lines render
- [ ] Disable MACD while on MACD tab → tab auto-switches to RSI or StochRSI
- [ ] Disable all three oscillators → subpanel disappears; main chart grows
- [ ] Re-enable one oscillator → subpanel reappears
- [ ] Switch time period → all subpanel charts update with new data
