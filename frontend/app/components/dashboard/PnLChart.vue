<template>
  <ClientOnly>
    <div v-if="loading" class="flex items-center justify-center h-48 text-muted text-sm">
      Loading chart…
    </div>
    <div v-else-if="!seriesData.length" class="flex items-center justify-center h-48 text-muted text-sm">
      No data available
    </div>
    <VueApexCharts
      v-else
      type="area"
      height="192"
      :options="chartOptions"
      :series="series"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{
  data: { date: string; pnl: number }[]
  loading?: boolean
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const seriesData = computed(() => props.data)

const chartOptions = computed((): ApexCharts.ApexOptions => ({
  chart: {
    type: 'area' as const,
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
    categories: seriesData.value.map(d => d.date),
    labels: { style: { colors: isDark.value ? '#8b949e' : '#57606a' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: isDark.value ? '#8b949e' : '#57606a' },
      formatter: (v: number) => `$${v}`,
    },
  },
  grid: { borderColor: isDark.value ? '#30363d' : '#d0d7de', strokeDashArray: 4 },
  tooltip: { theme: isDark.value ? 'dark' : 'light' },
}))

const series = computed(() => [{ name: 'PnL', data: seriesData.value.map(d => d.pnl) }])
</script>
