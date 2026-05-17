# Phase 6 — Indicator UI (Preset Picker + Custom Formula + Sub-Panes)

## Goal
Let users add indicators from a preset list or write a custom formula. Render overlay indicators on the main chart and sub-pane indicators below it.

## Depends On
Phase 3 (indicator backend) and Phase 5 (chart core) must be complete.

---

## 1. `stores/indicator.ts`

```ts
import { defineStore } from "pinia"
import { useChartStore } from "~/stores/chart"
import type { ActiveIndicator, IndicatorSeries } from "~/types"

export const useIndicatorStore = defineStore("indicator", {
  state: () => ({
    indicators: [] as ActiveIndicator[],
  }),

  actions: {
    async addIndicator(config: Omit<ActiveIndicator, "id" | "series">) {
      const chartStore = useChartStore()
      const runtimeConfig = useRuntimeConfig()
      const id = crypto.randomUUID()

      // Send OHLCV + indicator config to backend
      try {
        const res = await $fetch<{ series: IndicatorSeries[] }>(
          `${runtimeConfig.public.apiBase}/indicator/compute`,
          {
            method: "POST",
            body: {
              type:    config.type,
              params:  config.params,
              formula: config.formula ?? null,
              data: {
                time:   chartStore.candles.map(c => c.time),
                open:   chartStore.candles.map(c => c.open),
                high:   chartStore.candles.map(c => c.high),
                low:    chartStore.candles.map(c => c.low),
                close:  chartStore.candles.map(c => c.close),
                volume: chartStore.candles.map(c => c.volume),
              },
            },
          }
        )
        this.indicators.push({ ...config, id, series: res.series })
      } catch (e: any) {
        throw new Error(e?.data?.detail || "Indicator computation failed")
      }
    },

    removeIndicator(id: string) {
      this.indicators = this.indicators.filter(i => i.id !== id)
    },
  },
})
```

---

## 2. `composables/useIndicator.ts`

```ts
import { useIndicatorStore } from "~/stores/indicator"

export function useIndicator() {
  const store = useIndicatorStore()
  return { store }
}
```

---

## 3. Preset Indicator Definitions

Create `utils/indicatorDefs.ts`:

```ts
export interface IndicatorDef {
  type:    string
  label:   string
  pane:    "main" | "sub"
  color:   string
  defaultParams: Record<string, number | string>
}

export const INDICATOR_DEFS: IndicatorDef[] = [
  { type: "SMA",      label: "SMA",            pane: "main", color: "#f48fb1", defaultParams: { length: 14 } },
  { type: "EMA",      label: "EMA",            pane: "main", color: "#80cbc4", defaultParams: { length: 14 } },
  { type: "BB",       label: "Bollinger Bands", pane: "main", color: "#ce93d8", defaultParams: { length: 20, std: 2 } },
  { type: "RSI",      label: "RSI",            pane: "sub",  color: "#4fc3f7", defaultParams: { length: 14 } },
  { type: "MACD",     label: "MACD",           pane: "sub",  color: "#ffb74d", defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { type: "STOCHRSI", label: "Stochastic RSI", pane: "sub",  color: "#aed581", defaultParams: { length: 14, rsi_length: 14, k: 3, d: 3 } },
  { type: "ZSCORE",   label: "Z-Score",        pane: "sub",  color: "#ff8a65", defaultParams: { length: 20 } },
]
```

---

## 4. `components/indicator/PresetPicker.vue`

```vue
<template>
  <div class="space-y-2">
    <p class="text-xs text-[var(--color-muted)] uppercase tracking-wide">Preset Indicators</p>
    <div
      v-for="def in defs"
      :key="def.type"
      @click="add(def)"
      class="flex items-center justify-between px-3 py-2 rounded cursor-pointer
             hover:bg-[var(--color-border)] text-sm"
    >
      <span :style="{ color: def.color }">{{ def.label }}</span>
      <span class="text-[var(--color-muted)] text-xs">{{ def.pane }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INDICATOR_DEFS } from "~/utils/indicatorDefs"
const iStore = useIndicatorStore()
const defs   = INDICATOR_DEFS
const error  = ref("")

async function add(def: typeof defs[0]) {
  try {
    await iStore.addIndicator({
      type:   def.type,
      params: { ...def.defaultParams },
      pane:   def.pane,
      color:  def.color,
    })
  } catch (e: any) { error.value = e.message }
}
</script>
```

---

## 5. `components/indicator/FormulaEditor.vue`

```vue
<template>
  <div class="space-y-2 pt-2 border-t border-[var(--color-border)]">
    <p class="text-xs text-[var(--color-muted)] uppercase tracking-wide">Custom Formula</p>
    <textarea
      v-model="formula"
      placeholder="e.g. (close - SMA(close,20)) / STD(close,20)"
      rows="3"
      class="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded
             px-3 py-2 text-sm text-[var(--color-text)] font-mono resize-none
             focus:outline-none focus:border-[var(--color-accent)]"
    />
    <p class="text-xs text-[var(--color-muted)]">
      Available: open, high, low, close, volume, SMA(col,n), EMA(col,n), STD(col,n)
    </p>
    <button
      @click="apply"
      :disabled="loading"
      class="w-full py-1.5 rounded bg-[var(--color-accent)] text-white text-sm font-medium
             hover:opacity-90 disabled:opacity-50"
    >
      {{ loading ? "Computing..." : "Apply Formula" }}
    </button>
    <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const iStore  = useIndicatorStore()
const formula = ref("")
const loading = ref(false)
const error   = ref("")

async function apply() {
  if (!formula.value.trim()) return
  loading.value = true
  error.value   = ""
  try {
    await iStore.addIndicator({
      type:    "CUSTOM",
      params:  {},
      formula: formula.value,
      pane:    "sub",
      color:   "#f06292",
    })
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
```

---

## 6. `components/toolbar/IndicatorPanel.vue`

Slide-out panel triggered by an "Indicators" button in the toolbar.

```vue
<template>
  <div class="relative">
    <button
      @click="open = !open"
      class="px-3 py-1 text-sm rounded border border-[var(--color-border)]
             text-[var(--color-text)] hover:border-[var(--color-accent)]"
    >
      Indicators ({{ iStore.indicators.length }})
    </button>

    <div
      v-if="open"
      class="absolute top-full right-0 mt-2 w-72 bg-[var(--color-surface)]
             border border-[var(--color-border)] rounded shadow-xl z-50 p-4 space-y-4"
    >
      <!-- Active indicators list -->
      <div v-if="iStore.indicators.length" class="space-y-1">
        <p class="text-xs text-[var(--color-muted)] uppercase tracking-wide">Active</p>
        <div
          v-for="ind in iStore.indicators"
          :key="ind.id"
          class="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-[var(--color-border)]"
        >
          <span :style="{ color: ind.color }">{{ ind.series[0]?.name ?? ind.type }}</span>
          <button @click="iStore.removeIndicator(ind.id)" class="text-[var(--color-muted)] hover:text-red-400 ml-2">✕</button>
        </div>
      </div>

      <PresetPicker />
      <FormulaEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
const iStore = useIndicatorStore()
const open   = ref(false)
</script>
```

---

## 7. `components/chart/IndicatorPane.vue`

Renders a sub-pane below the main chart using a separate lightweight-charts instance.

```vue
<template>
  <div
    v-for="group in subPaneGroups"
    :key="group.indicatorId"
    class="border-t border-[var(--color-border)]"
    style="height: 120px;"
  >
    <div :ref="el => mountPane(el as HTMLDivElement, group)" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { createChart, LineSeries, type IChartApi } from "lightweight-charts"

const iStore = useIndicatorStore()
const charts = new Map<string, IChartApi>()

const subPaneGroups = computed(() =>
  iStore.indicators
    .filter(i => i.pane === "sub")
    .map(i => ({ indicatorId: i.id, series: i.series, color: i.color }))
)

function mountPane(el: HTMLDivElement | null, group: any) {
  if (!el || charts.has(group.indicatorId)) return

  const chart = createChart(el, {
    layout:    { background: { color: "#0f1117" }, textColor: "#d1d4dc" },
    grid:      { vertLines: { color: "#2a2d3a" }, horzLines: { color: "#2a2d3a" } },
    rightPriceScale: { borderColor: "#2a2d3a" },
    timeScale: { borderColor: "#2a2d3a", timeVisible: true },
    width:  el.clientWidth,
    height: el.clientHeight,
  })

  group.series.forEach((s: any, idx: number) => {
    const lineSeries = chart.addSeries(LineSeries, {
      color:     idx === 0 ? group.color : "#aaaaaa",
      lineWidth: 1,
    })
    const data = s.time
      .map((t: number, i: number) => ({ time: t as any, value: s.values[i] }))
      .filter((d: any) => d.value !== null)
    lineSeries.setData(data)
  })

  chart.timeScale().fitContent()
  charts.set(group.indicatorId, chart)

  const ro = new ResizeObserver(() => {
    if (el) chart.resize(el.clientWidth, el.clientHeight)
  })
  ro.observe(el)
}

// Overlay indicators go directly onto the main chart via a shared event
// (handled in pages/index.vue by watching iStore.indicators and overlaying LineSeries)
</script>
```

---

## 8. Handle Main-Pane (Overlay) Indicators in `pages/index.vue`

In the `onChartReady` handler, watch for new overlay indicators and add LineSeries to the main chart:

```ts
import { LineSeries } from "lightweight-charts"

let mainChart: IChartApi | null = null
const overlaySeriesMap = new Map<string, any[]>()

function onChartReady(chart: IChartApi) {
  mainChart = chart
}

watch(
  () => iStore.indicators,
  (indicators) => {
    if (!mainChart) return

    // Remove series for removed indicators
    for (const [id, seriesList] of overlaySeriesMap.entries()) {
      if (!indicators.find(i => i.id === id)) {
        seriesList.forEach(s => mainChart!.removeSeries(s))
        overlaySeriesMap.delete(id)
      }
    }

    // Add series for new overlay indicators
    for (const ind of indicators.filter(i => i.pane === "main")) {
      if (overlaySeriesMap.has(ind.id)) continue
      const added: any[] = []
      ind.series.forEach((s, idx) => {
        const ls = mainChart!.addSeries(LineSeries, {
          color:     idx === 0 ? ind.color : "#aaaaaa",
          lineWidth: 1,
        })
        const data = s.time
          .map((t, i) => ({ time: t as any, value: s.values[i] }))
          .filter(d => d.value !== null)
        ls.setData(data)
        added.push(ls)
      })
      overlaySeriesMap.set(ind.id, added)
    }
  },
  { deep: true }
)
```

Also add `<IndicatorPane />` and `<IndicatorPanel />` to the template in the correct slots.

---

## Acceptance Criteria
- [ ] Clicking "Indicators" opens the panel
- [ ] Clicking SMA from the preset list overlays a line on the main chart
- [ ] Clicking RSI adds a sub-pane chart below the main chart
- [ ] Typing a custom formula and clicking Apply adds a sub-pane with computed values
- [ ] Clicking ✕ on an active indicator removes it from the chart
- [ ] Bad formula shows an error message in red
