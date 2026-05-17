<script setup lang="ts">
import { LineSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'

const chartStore = useChartStore()
const iStore = useIndicatorStore()

const mainChart = ref<IChartApi | null>(null)
const overlaySeriesMap = new Map<string, ISeriesApi<'Line'>[]>()

function onChartReady(chart: IChartApi) {
  mainChart.value = chart
}

watch(
  () => iStore.indicators,
  (indicators) => {
    if (!mainChart.value) return

    const currentIds = new Set(indicators.map(i => i.id))

    // Remove series for indicators no longer present
    for (const [id, seriesList] of overlaySeriesMap) {
      if (!currentIds.has(id)) {
        seriesList.forEach(s => mainChart.value!.removeSeries(s))
        overlaySeriesMap.delete(id)
      }
    }

    // Add series for new main-pane indicators
    for (const ind of indicators) {
      if (ind.pane !== 'main' || overlaySeriesMap.has(ind.id)) continue
      const seriesList: ISeriesApi<'Line'>[] = []
      for (const s of ind.series) {
        const line = mainChart.value.addSeries(LineSeries, {
          color: ind.color,
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          title: s.name,
        })
        const data = s.time
          .map((t, i) => ({ time: t, value: s.values[i] }))
          .filter(d => d.value !== null) as { time: number; value: number }[]
        line.setData(data as any)
        seriesList.push(line)
      }
      overlaySeriesMap.set(ind.id, seriesList)
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="page-container">
    <!-- Top toolbar -->
    <Toolbar class="top-toolbar">
      <template #start>
        <span class="logo">StockChart</span>
        <TickerSearch />
        <IntervalSelector />
        <span v-if="chartStore.loading" class="status-loading">Loading…</span>
        <span v-if="chartStore.error" class="status-error">{{ chartStore.error }}</span>
      </template>
      <template #end>
        <IndicatorPanel />
      </template>
    </Toolbar>

    <!-- Body -->
    <div class="body-container">
      <DrawingToolbar />
      <div class="chart-area">
        <ClientOnly>
          <CandlestickChart @chart-ready="onChartReady" />
          <IndicatorPane />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg);
}

.top-toolbar {
  flex-shrink: 0;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  gap: 0.5rem;
}

.logo {
  font-weight: bold;
  font-size: 1rem;
  color: var(--color-accent);
  margin-right: 0.75rem;
}

.body-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
}

.chart-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.status-loading {
  color: var(--color-muted);
  font-size: 0.82rem;
  margin-left: 0.5rem;
}

.status-error {
  color: var(--color-down);
  font-size: 0.82rem;
  margin-left: 0.5rem;
}
</style>
