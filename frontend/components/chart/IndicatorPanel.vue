<script setup lang="ts">
import { createChart, LineSeries, HistogramSeries, LineStyle } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, LogicalRange } from 'lightweight-charts'
import type { IndicatorsData, EMAPoint } from '~/types/api'
import type { IndicatorState } from '~/composables/useIndicatorState'
import { baseChartOptions, CHART_COLORS } from '~/utils/chartTheme'
import ChartSkeleton from './ChartSkeleton.vue'

type Tab = 'macd' | 'rsi' | 'stochrsi'

const props = defineProps<{
  indicators: IndicatorsData
  indicatorState: IndicatorState
  activeTab: Tab
  loading?: boolean
  range?: LogicalRange | null
}>()

const emit = defineEmits<{ 'update:activeTab': [tab: Tab] }>()

const ALL_TABS: { label: string, value: Tab, key: keyof IndicatorState }[] = [
  { label: 'MACD', value: 'macd', key: 'macd' },
  { label: 'RSI', value: 'rsi', key: 'rsi' },
  { label: 'Stoch RSI', value: 'stochrsi', key: 'stochRsi' },
]

const availTabs = computed(() => ALL_TABS.filter(t => props.indicatorState[t.key]))
const oscEnabled = computed(() => availTabs.value.length > 0)

function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x)
}
function lastVal(arr?: EMAPoint[]): number | null {
  if (!arr) return null
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i]?.value != null) return arr[i].value
  return null
}
// Lightweight Charts rejects non-numeric values; drop warmup nulls/NaNs.
function linePoints(arr?: EMAPoint[]): EMAPoint[] {
  return (arr ?? []).filter(p => isNum(p?.value))
}
const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(2))

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
const observers: ResizeObserver[] = []

const CHART_OPTS = {
  ...baseChartOptions,
  width: 0,
  height: 0,
  rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)', scaleMargins: { top: 0.16, bottom: 0.12 } },
  timeScale: { ...baseChartOptions.timeScale, visible: false },
  handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
  handleScale: { mouseWheel: false, pinch: false },
}

function makeObserver(chart: IChartApi) {
  const ro = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect
    if (width > 0 && height > 0) {
      chart.resize(width, height)
      applyRange(chart)
    }
  })
  observers.push(ro)
  return ro
}

function applyRange(chart: IChartApi) {
  if (props.range) {
    try { chart.timeScale().setVisibleLogicalRange(props.range) }
    catch { chart.timeScale().fitContent() }
  } else {
    chart.timeScale().fitContent()
  }
}

function setMacd() {
  if (!macdChart) return
  macdLine?.setData(linePoints(props.indicators.macd.macd))
  signalLine?.setData(linePoints(props.indicators.macd.signal))
  histSeries?.setData(props.indicators.macd.histogram
    .filter(b => isNum(b?.value))
    .map(b => ({
      time: b.time, value: b.value,
      color: b.value >= 0 ? 'rgba(46,189,133,0.5)' : 'rgba(246,70,93,0.5)',
    })))
  applyRange(macdChart)
}
function setRsi() {
  if (!rsiChart) return
  rsiLine?.setData(linePoints(props.indicators.rsi))
  applyRange(rsiChart)
}
function setStoch() {
  if (!stochChart) return
  kLine?.setData(linePoints(props.indicators.stoch_rsi.k))
  dLine?.setData(linePoints(props.indicators.stoch_rsi.d))
  applyRange(stochChart)
}

onMounted(() => {
  if (macdContainer.value) {
    macdChart = createChart(macdContainer.value, CHART_OPTS)
    macdLine = macdChart.addSeries(LineSeries, { color: CHART_COLORS.ema50, lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
    signalLine = macdChart.addSeries(LineSeries, { color: CHART_COLORS.accent, lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
    histSeries = macdChart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false })
    setMacd()
    makeObserver(macdChart).observe(macdContainer.value)
  }
  if (rsiContainer.value) {
    rsiChart = createChart(rsiContainer.value, CHART_OPTS)
    rsiLine = rsiChart.addSeries(LineSeries, { color: CHART_COLORS.ema100, lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
    rsiLine.createPriceLine({ price: 70, color: 'rgba(246,70,93,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '70' })
    rsiLine.createPriceLine({ price: 30, color: 'rgba(46,189,133,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '30' })
    setRsi()
    makeObserver(rsiChart).observe(rsiContainer.value)
  }
  if (stochContainer.value) {
    stochChart = createChart(stochContainer.value, CHART_OPTS)
    kLine = stochChart.addSeries(LineSeries, { color: CHART_COLORS.ema50, lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
    dLine = stochChart.addSeries(LineSeries, { color: '#ff9e64', lineWidth: 2, priceLineVisible: false, lastValueVisible: false })
    kLine.createPriceLine({ price: 80, color: 'rgba(246,70,93,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '80' })
    kLine.createPriceLine({ price: 20, color: 'rgba(46,189,133,0.4)', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '20' })
    setStoch()
    makeObserver(stochChart).observe(stochContainer.value)
  }
})

onUnmounted(() => {
  observers.forEach(o => o.disconnect())
  macdChart?.remove(); rsiChart?.remove(); stochChart?.remove()
  macdChart = rsiChart = stochChart = null
})

watch(() => props.indicators, () => { setMacd(); setRsi(); setStoch() })
watch(() => props.range, () => {
  if (macdChart) applyRange(macdChart)
  if (rsiChart) applyRange(rsiChart)
  if (stochChart) applyRange(stochChart)
})

// Value readouts for the active tab.
const macdVals = computed(() => ({
  macd: lastVal(props.indicators.macd.macd),
  signal: lastVal(props.indicators.macd.signal),
  hist: lastVal(props.indicators.macd.histogram),
}))
const rsiVal = computed(() => lastVal(props.indicators.rsi))
const stochVals = computed(() => ({ k: lastVal(props.indicators.stoch_rsi.k), d: lastVal(props.indicators.stoch_rsi.d) }))
</script>

<template>
  <div class="osc-wrap" :style="{ height: oscEnabled ? '188px' : '0px', opacity: oscEnabled ? 1 : 0 }">
    <div class="osc-bar">
      <div class="osc-tabs">
        <button
          v-for="o in availTabs"
          :key="o.value"
          class="osc-tab"
          :class="{ active: activeTab === o.value }"
          @click="emit('update:activeTab', o.value)"
        >
          {{ o.label }}
        </button>
      </div>
      <div class="osc-vals">
        <template v-if="activeTab === 'macd'">
          <span class="osc-v">MACD<b :style="{ color: CHART_COLORS.ema50 }">{{ fmt(macdVals.macd) }}</b></span>
          <span class="osc-v">signal<b :style="{ color: CHART_COLORS.accent }">{{ fmt(macdVals.signal) }}</b></span>
          <span class="osc-v">hist<b :class="(macdVals.hist ?? 0) >= 0 ? 'up' : 'down'">{{ fmt(macdVals.hist) }}</b></span>
        </template>
        <template v-else-if="activeTab === 'rsi'">
          <span class="osc-v">RSI 14<b :style="{ color: CHART_COLORS.ema100 }">{{ fmt(rsiVal) }}</b></span>
        </template>
        <template v-else-if="activeTab === 'stochrsi'">
          <span class="osc-v">%K<b :style="{ color: CHART_COLORS.ema50 }">{{ fmt(stochVals.k) }}</b></span>
          <span class="osc-v">%D<b style="color:#ff9e64">{{ fmt(stochVals.d) }}</b></span>
        </template>
      </div>
    </div>

    <div class="osc-chart">
      <div v-show="activeTab === 'macd'" ref="macdContainer" class="absolute inset-0" />
      <div v-show="activeTab === 'rsi'" ref="rsiContainer" class="absolute inset-0" />
      <div v-show="activeTab === 'stochrsi'" ref="stochContainer" class="absolute inset-0" />
      <div v-if="loading" class="absolute inset-0 z-20"><ChartSkeleton /></div>
    </div>
  </div>
</template>
