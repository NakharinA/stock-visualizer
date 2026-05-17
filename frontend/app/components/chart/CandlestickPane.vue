<script setup lang="ts">
import type { Candle, IndicatorSeries } from '~/types'

const props = defineProps<{
  candles: Candle[]
  emaOverlays: { length: number; series: IndicatorSeries }[]
}>()

const chartOptions = computed(() => ({
  chart: {
    id: 'candlestick-main',
    group: 'stockChart',
    type: 'candlestick',
    height: 380,
    toolbar: { show: true, autoSelected: 'zoom' },
    zoom: { enabled: true },
    animations: { enabled: false },
    background: 'transparent',
  },
  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    tooltip: { enabled: true },
    labels: {
      formatter: (val: number) => '$' + val.toFixed(2),
    },
  },
  tooltip: {
    shared: false,
    custom: undefined,
  },
  plotOptions: {
    candlestick: {
      colors: { upward: '#22c55e', downward: '#ef4444' },
      wick: { useFillColor: true },
    },
  },
  legend: { show: props.emaOverlays.length > 0 },
  grid: { borderColor: '#e2e8f0' },
}))

const EMA_COLORS: Record<number, string> = {
  20: '#6366f1',
  50: '#f59e0b',
  100: '#8b5cf6',
  200: '#0ea5e9',
}

const series = computed(() => {
  const candleData = props.candles.map((c) => ({
    x: c.time * 1000,
    y: [c.open, c.high, c.low, c.close],
  }))

  const base = [{ name: 'Price', type: 'candlestick', data: candleData, color: undefined }]

  const emaLines = props.emaOverlays.map(({ length, series: s }) => ({
    name: `EMA ${length}`,
    type: 'line',
    data: s.time.map((t, i) => ({ x: t * 1000, y: s.values[i] })).filter((p) => p.y != null),
    color: EMA_COLORS[length] ?? '#94a3b8',
  }))

  return [...base, ...emaLines]
})
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-label">Price Chart</div>
    <ClientOnly>
      <ApexChart type="candlestick" :height="380" :options="chartOptions" :series="series" />
      <template #fallback>
        <div style="height: 380px; display: flex; align-items: center; justify-content: center; color: var(--p-text-muted-color)">
          Loading chart…
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
