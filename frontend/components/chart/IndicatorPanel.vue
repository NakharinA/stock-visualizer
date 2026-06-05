<script setup lang="ts">
import { createChart, LineSeries, HistogramSeries, LineStyle } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import type { IndicatorsData } from '~/types/api'
import type { IndicatorState } from '~/composables/useIndicatorState'

const props = defineProps<{
  indicators: IndicatorsData
  indicatorState: IndicatorState
  activeTab: 'macd' | 'rsi' | 'stochrsi'
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'macd' | 'rsi' | 'stochrsi']
}>()

const tabs = [
  { label: 'MACD', value: 'macd' as const },
  { label: 'RSI', value: 'rsi' as const },
  { label: 'Stoch RSI', value: 'stochrsi' as const },
]

const subpanelVisible = computed(
  () => props.indicatorState.macd || props.indicatorState.rsi || props.indicatorState.stochRsi,
)

const macdContainer = ref<HTMLDivElement>()
const rsiContainer = ref<HTMLDivElement>()
const stochContainer = ref<HTMLDivElement>()

let macdChart: IChartApi | null = null
let rsiChart: IChartApi | null = null
let stochChart: IChartApi | null = null

let macdLine: ISeriesApi<'Line'> | null = null
let signalLine: ISeriesApi<'Line'> | null = null
let histSeries: ISeriesApi<'Histogram'> | null = null
let rsiLine: ISeriesApi<'Line'> | null = null
let kLine: ISeriesApi<'Line'> | null = null
let dLine: ISeriesApi<'Line'> | null = null

let macdObserver: ResizeObserver | null = null
let rsiObserver: ResizeObserver | null = null
let stochObserver: ResizeObserver | null = null

const CHART_OPTS = {
  width: 0,
  height: 0,
  layout: { background: { color: '#0f1117' }, textColor: '#d1d5db' },
  grid: { vertLines: { visible: false }, horzLines: { color: '#1f2937' } },
  timeScale: { visible: false },
  handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false },
  handleScale: { mouseWheel: false, pinch: false },
}

function makeObserver(chart: IChartApi) {
  return new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect
    if (width > 0 && height > 0) {
      chart.resize(width, height)
      chart.timeScale().fitContent()
    }
  })
}

function setMacdData() {
  if (!props.indicators?.macd || !macdChart) return
  macdLine?.setData(props.indicators.macd.macd)
  signalLine?.setData(props.indicators.macd.signal)
  histSeries?.setData(
    props.indicators.macd.histogram.map(bar => ({
      time: bar.time,
      value: bar.value,
      color: bar.value >= 0 ? '#22c55e' : '#ef4444',
    })),
  )
  macdChart.timeScale().fitContent()
}

function setRsiData() {
  if (!props.indicators?.rsi || !rsiChart) return
  rsiLine?.setData(props.indicators.rsi)
  rsiChart.timeScale().fitContent()
}

function setStochData() {
  if (!props.indicators?.stoch_rsi || !stochChart) return
  kLine?.setData(props.indicators.stoch_rsi.k)
  dLine?.setData(props.indicators.stoch_rsi.d)
  stochChart.timeScale().fitContent()
}

onMounted(() => {
  if (macdContainer.value) {
    macdChart = createChart(macdContainer.value, CHART_OPTS)
    macdLine = macdChart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    signalLine = macdChart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    histSeries = macdChart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      lastValueVisible: false,
    })
    setMacdData()
    macdObserver = makeObserver(macdChart)
    macdObserver.observe(macdContainer.value)
  }

  if (rsiContainer.value) {
    rsiChart = createChart(rsiContainer.value, CHART_OPTS)
    rsiLine = rsiChart.addSeries(LineSeries, {
      color: '#a855f7',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    rsiLine.createPriceLine({
      price: 70,
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '70',
    })
    rsiLine.createPriceLine({
      price: 30,
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '30',
    })
    setRsiData()
    rsiObserver = makeObserver(rsiChart)
    rsiObserver.observe(rsiContainer.value)
  }

  if (stochContainer.value) {
    stochChart = createChart(stochContainer.value, CHART_OPTS)
    kLine = stochChart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    dLine = stochChart.addSeries(LineSeries, {
      color: '#f97316',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    kLine.createPriceLine({
      price: 80,
      color: '#9ca3af',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '80',
    })
    kLine.createPriceLine({
      price: 20,
      color: '#9ca3af',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '20',
    })
    setStochData()
    stochObserver = makeObserver(stochChart)
    stochObserver.observe(stochContainer.value)
  }
})

onUnmounted(() => {
  macdObserver?.disconnect()
  rsiObserver?.disconnect()
  stochObserver?.disconnect()
  macdChart?.remove()
  rsiChart?.remove()
  stochChart?.remove()
  macdChart = null
  rsiChart = null
  stochChart = null
  macdLine = null
  signalLine = null
  histSeries = null
  rsiLine = null
  kLine = null
  dLine = null
  macdObserver = null
  rsiObserver = null
  stochObserver = null
})

watch(
  () => props.indicators,
  () => {
    setMacdData()
    setRsiData()
    setStochData()
  },
)
</script>

<template>
  <!-- v-show (not v-if) keeps DOM alive so onMounted can populate refs and init charts -->
  <div v-show="subpanelVisible" class="shrink-0 h-[140px] flex flex-col bg-[#0f1117]">
    <!-- Tab bar -->
    <div class="flex gap-1 px-2 pt-1 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="px-3 py-1 text-xs rounded transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        "
        @click="emit('update:activeTab', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- MACD chart -->
    <div v-show="activeTab === 'macd'" class="flex-1 min-h-0 relative">
      <div
        v-if="!indicatorState.macd"
        class="absolute inset-0 bg-[#0f1117] flex items-center justify-center text-xs text-gray-500 z-10"
      >
        Enable MACD in the indicator panel to view this chart
      </div>
      <div ref="macdContainer" class="w-full h-full" />
    </div>

    <!-- RSI chart -->
    <div v-show="activeTab === 'rsi'" class="flex-1 min-h-0 relative">
      <div
        v-if="!indicatorState.rsi"
        class="absolute inset-0 bg-[#0f1117] flex items-center justify-center text-xs text-gray-500 z-10"
      >
        Enable RSI in the indicator panel to view this chart
      </div>
      <div ref="rsiContainer" class="w-full h-full" />
    </div>

    <!-- Stoch RSI chart -->
    <div v-show="activeTab === 'stochrsi'" class="flex-1 min-h-0 relative">
      <div
        v-if="!indicatorState.stochRsi"
        class="absolute inset-0 bg-[#0f1117] flex items-center justify-center text-xs text-gray-500 z-10"
      >
        Enable Stoch RSI in the indicator panel to view this chart
      </div>
      <div ref="stochContainer" class="w-full h-full" />
    </div>
  </div>
</template>
