<template>
  <ClientOnly>
    <VueApexCharts
      type="area"
      height="192"
      :options="chartOptions"
      :series="series"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const pnlData = [
  { x: 'Mon', y: 300 },
  { x: 'Tue', y: -150 },
  { x: 'Wed', y: 620 },
  { x: 'Thu', y: 410 },
  { x: 'Fri', y: -80 },
  { x: 'Sat', y: 720 },
  { x: 'Sun', y: 1240 },
]

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    background: 'transparent',
    toolbar: { show: false },
  },
  theme: { mode: isDark.value ? 'dark' : 'light' },
  colors: ['#58a6ff'],
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 },
  },
  stroke: { curve: 'smooth', width: 2 },
  dataLabels: { enabled: false },
  xaxis: {
    categories: pnlData.map(d => d.x),
    labels: { style: { colors: '#8b949e' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#8b949e' },
      formatter: (v: number) => `$${v}`,
    },
  },
  grid: { borderColor: '#30363d', strokeDashArray: 4 },
  tooltip: { theme: isDark.value ? 'dark' : 'light' },
}))

const series = [{ name: 'PnL', data: pnlData.map(d => d.y) }]
</script>
