## Phase 6 — Indicator UI

### Depends On: Phase 3 + 5

### utils/indicatorDefs.ts
INDICATOR_DEFS array:
  SMA  {pane:main, color:#f48fb1, defaultParams:{length:14}}
  EMA  {pane:main, color:#80cbc4, defaultParams:{length:14}}
  BB   {pane:main, color:#ce93d8, defaultParams:{length:20, std:2}}
  RSI  {pane:sub,  color:#4fc3f7, defaultParams:{length:14}}
  MACD {pane:sub,  color:#ffb74d, defaultParams:{fast:12, slow:26, signal:9}}
  STOCHRSI {pane:sub, color:#aed581, defaultParams:{length:14,rsi_length:14,k:3,d:3}}
  ZSCORE   {pane:sub, color:#ff8a65, defaultParams:{length:20}}

### stores/indicator.ts
state: indicators: ActiveIndicator[]
actions:
  addIndicator(config) → POST /indicator/compute with full OHLCV from chartStore.candles
                         push {…config, id: crypto.randomUUID(), series: res.series}
  removeIndicator(id)  → filter out

### composables/useIndicator.ts
export function useIndicator() { return { store: useIndicatorStore() } }

### components/indicator/PresetPicker.vue
- PrimeVue Listbox or plain list
- Each row: colored label + pane badge + click calls iStore.addIndicator(def defaults)
- Shows error message via PrimeVue Message component on failure

### components/indicator/FormulaEditor.vue
- PrimeVue Textarea (v-model=formula, rows=3, font-mono)
- Helper text: "Available: open, high, low, close, volume, SMA(col,n), EMA(col,n), STD(col,n)"
- PrimeVue Button "Apply Formula" → calls iStore.addIndicator({type:"CUSTOM", pane:"sub", formula})
- PrimeVue Message severity="error" shown on failure

### components/toolbar/IndicatorPanel.vue
- PrimeVue Button "Indicators (N)" → toggles OverlayPanel ref
- PrimeVue OverlayPanel content:
    Active list: each indicator row = colored name + PrimeVue Button icon="pi pi-times" @click=removeIndicator
    Divider
    PresetPicker
    Divider
    FormulaEditor

### components/chart/IndicatorPane.vue
- v-for over iStore.indicators.filter(i => i.pane === "sub")
- Each pane: div style="height:120px" with ref callback mountPane()
- mountPane(): createChart() + addSeries(LineSeries) per series in group, fitContent, ResizeObserver
- Track charts in Map<indicatorId, IChartApi> to avoid duplicate mounts

### pages/index.vue changes
- Import iStore = useIndicatorStore()
- Add IndicatorPanel to toolbar
- Add IndicatorPane below CandlestickChart
- In onChartReady: store mainChart ref
- watch(iStore.indicators, deep:true):
    Remove LineSeries from mainChart for removed overlay indicators (via overlaySeriesMap)
    Add LineSeries to mainChart for new pane:"main" indicators

### Acceptance
Preset SMA → overlays on main chart
Preset RSI → adds sub-pane below
Custom formula → computes and adds sub-pane
X button removes indicator + its series
Bad formula → red error message shown