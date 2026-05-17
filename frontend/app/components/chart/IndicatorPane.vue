<script setup lang="ts">
import { createChart, LineSeries } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'

const iStore = useIndicatorStore()
const subIndicators = computed(() => iStore.indicators.filter(i => i.pane === 'sub'))
const chartMap = new Map<string, IChartApi>()

function mountPane(id: string, el: HTMLElement | null) {
  if (!el) {
    const c = chartMap.get(id)
    if (c) { c.remove(); chartMap.delete(id) }
    return
  }
  if (chartMap.has(id)) return

  const indicator = iStore.indicators.find(i => i.id === id)
  if (!indicator) return

  const c = createChart(el, {
    layout: { background: { color: '#0f1117' }, textColor: '#d1d4dc' },
    grid: { vertLines: { color: '#2a2d3a' }, horzLines: { color: '#2a2d3a' } },
    rightPriceScale: { borderColor: '#2a2d3a' },
    timeScale: { borderColor: '#2a2d3a', timeVisible: true, visible: false },
    width: el.clientWidth || 600,
    height: 120,
    handleScroll: false,
    handleScale: false,
  })

  for (const s of indicator.series) {
    const line = c.addSeries(LineSeries, {
      color: indicator.color,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: s.name,
    })
    const data = s.time
      .map((t, i) => ({ time: t, value: s.values[i] }))
      .filter(d => d.value !== null) as { time: number; value: number }[]
    line.setData(data as any)
  }

  c.timeScale().fitContent()
  chartMap.set(id, c)

  const ro = new ResizeObserver(() => c.resize(el.clientWidth || 600, 120))
  ro.observe(el)
}

onUnmounted(() => {
  for (const c of chartMap.values()) c.remove()
  chartMap.clear()
})
</script>

<template>
  <div v-if="subIndicators.length" class="indicator-pane-wrapper">
    <div
      v-for="ind in subIndicators"
      :key="ind.id"
      class="sub-pane"
    >
      <div class="pane-label">{{ ind.type }}</div>
      <div :ref="(el: any) => mountPane(ind.id, el)" class="pane-chart" />
    </div>
  </div>
</template>

<style scoped>
.indicator-pane-wrapper {
  border-top: 1px solid var(--color-border);
}
.sub-pane {
  position: relative;
  border-top: 1px solid var(--color-border);
}
.sub-pane:first-child {
  border-top: none;
}
.pane-label {
  position: absolute;
  top: 4px;
  left: 8px;
  font-size: 0.7rem;
  color: var(--color-muted);
  z-index: 1;
  pointer-events: none;
}
.pane-chart {
  height: 120px;
  width: 100%;
}
</style>
