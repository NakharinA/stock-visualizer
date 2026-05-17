<script setup lang="ts">
import type { IndicatorSeries } from '~/types'

const props = defineProps<{
  label: string
  indicatorType: string
  seriesList: IndicatorSeries[]
  height?: number
}>()

const SERIES_COLORS: Record<string, string[]> = {
  RSI: ['#6366f1'],
  STOCHRSI: ['#6366f1', '#f59e0b'],
  MACD: ['#6366f1', '#f59e0b', '#94a3b8'],
  ZSCORE: ['#0ea5e9'],
  VOLUME: ['#94a3b8'],
}

const annotations = computed(() => {
  if (props.indicatorType === 'RSI') {
    return {
      yaxis: [
        { y: 70, borderColor: '#ef4444', strokeDashArray: 4, label: { text: '70', style: { background: 'transparent', color: '#ef4444', fontSize: '10px' } } },
        { y: 30, borderColor: '#22c55e', strokeDashArray: 4, label: { text: '30', style: { background: 'transparent', color: '#22c55e', fontSize: '10px' } } },
      ],
    }
  }
  if (props.indicatorType === 'STOCHRSI') {
    return {
      yaxis: [
        { y: 80, borderColor: '#ef4444', strokeDashArray: 4, label: { text: '80', style: { background: 'transparent', color: '#ef4444', fontSize: '10px' } } },
        { y: 20, borderColor: '#22c55e', strokeDashArray: 4, label: { text: '20', style: { background: 'transparent', color: '#22c55e', fontSize: '10px' } } },
      ],
    }
  }
  if (props.indicatorType === 'ZSCORE') {
    return {
      yaxis: [
        { y: 2, borderColor: '#ef4444', strokeDashArray: 4, label: { text: '+2σ', style: { background: 'transparent', color: '#ef4444', fontSize: '10px' } } },
        { y: -2, borderColor: '#22c55e', strokeDashArray: 4, label: { text: '-2σ', style: { background: 'transparent', color: '#22c55e', fontSize: '10px' } } },
      ],
    }
  }
  return {}
})

const colors = computed(() => SERIES_COLORS[props.indicatorType] ?? ['#6366f1'])

const isBarChart = computed(() => props.indicatorType === 'VOLUME')

const isMixed = computed(() => props.indicatorType === 'MACD')

const chartOptions = computed(() => ({
  chart: {
    id: `indicator-${props.indicatorType}`,
    group: 'stockChart',
    type: isBarChart.value ? 'bar' : isMixed.value ? 'line' : 'line',
    height: props.height ?? 140,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: false },
    background: 'transparent',
  },
  colors: colors.value,
  xaxis: {
    type: 'datetime',
    labels: { datetimeUTC: false, show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => (isBarChart.value ? formatVolume(val) : val.toFixed(2)),
      style: { fontSize: '10px' },
    },
  },
  annotations: annotations.value,
  legend: { show: props.seriesList.length > 1 },
  grid: { borderColor: '#e2e8f0' },
  stroke: { width: isMixed.value ? [2, 2, 0] : 2 },
  plotOptions: {
    bar: {
      colors: {
        ranges: [
          { from: -Infinity, to: 0, color: '#ef4444' },
          { from: 0, to: Infinity, color: '#22c55e' },
        ],
      },
    },
  },
}))

const series = computed(() => {
  if (props.indicatorType === 'MACD') {
    return props.seriesList.map((s, idx) => ({
      name: s.name,
      type: idx === 2 ? 'bar' : 'line',
      data: s.time.map((t, i) => ({ x: t * 1000, y: s.values[i] })),
    }))
  }
  return props.seriesList.map((s) => ({
    name: s.name,
    type: isBarChart.value ? 'bar' : 'line',
    data: s.time.map((t, i) => ({ x: t * 1000, y: s.values[i] })),
  }))
})

function formatVolume(v: number): string {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return v.toFixed(0)
}
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-label">{{ label }}</div>
    <ClientOnly>
      <ApexChart
        :type="isBarChart ? 'bar' : isMixed ? 'line' : 'line'"
        :height="height ?? 140"
        :options="chartOptions"
        :series="series"
      />
      <template #fallback>
        <div :style="`height: ${height ?? 140}px`" />
      </template>
    </ClientOnly>
  </div>
</template>
