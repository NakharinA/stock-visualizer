<script setup lang="ts">
import {
  createChart, CandlestickSeries, LineSeries, HistogramSeries, CrosshairMode,
} from 'lightweight-charts'
import type {
  IChartApi, ISeriesApi, CandlestickData, IPriceLine, LogicalRange,
} from 'lightweight-charts'
import type { OHLCVBar, IndicatorsData, EMAPoint } from '~/types/api'
import type { IndicatorState } from '~/composables/useIndicatorState'
import { baseChartOptions, CHART_COLORS } from '~/utils/chartTheme'
import { fmtPrice, fmtSigned, fmtPct } from '~/utils/format'
import ChartSkeleton from './ChartSkeleton.vue'

const props = defineProps<{
  ohlcv: OHLCVBar[]
  indicators?: IndicatorsData
  indicatorState?: IndicatorState
  loading?: boolean
  symbol: string
  period: string
}>()

const emit = defineEmits<{ 'range-change': [range: LogicalRange | null] }>()

const EMA_DEFS = [
  { key: 'ema20', label: 'EMA 20', color: CHART_COLORS.ema20 },
  { key: 'ema50', label: 'EMA 50', color: CHART_COLORS.ema50 },
  { key: 'ema100', label: 'EMA 100', color: CHART_COLORS.ema100 },
  { key: 'ema200', label: 'EMA 200', color: CHART_COLORS.ema200 },
] as const

const container = ref<HTMLDivElement>()
const fvgCanvas = ref<HTMLCanvasElement>()

let chart: IChartApi | null = null
let series: ISeriesApi<'Candlestick'> | null = null
let volSeries: ISeriesApi<'Histogram'> | null = null
let observer: ResizeObserver | null = null
let raf = 0
let syncingOut = false

const emaSeries: Record<string, ISeriesApi<'Line'> | null> = {
  ema20: null, ema50: null, ema100: null, ema200: null,
}
let fibLines: IPriceLine[] = []
let srLines: IPriceLine[] = []

const hover = ref<{ open: number, high: number, low: number, close: number } | null>(null)

function isNum(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x)
}
// yfinance can emit NaN rows that serialize to null; Lightweight Charts rejects
// non-numeric OHLC, so drop any incomplete bar before handing data to the chart.
function validBars(bars: OHLCVBar[]): OHLCVBar[] {
  return bars.filter(b => isNum(b.open) && isNum(b.high) && isNum(b.low) && isNum(b.close))
}
function toBars(bars: OHLCVBar[]): CandlestickData[] {
  return validBars(bars).map(b => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close }))
}
function lastVal(arr?: EMAPoint[]): number | null {
  if (!arr) return null
  for (let i = arr.length - 1; i >= 0; i--) if (arr[i]?.value != null) return arr[i].value
  return null
}
// Drop warmup points whose value is null/NaN so line series only get numbers.
function linePoints(arr?: EMAPoint[]): EMAPoint[] {
  return (arr ?? []).filter(p => isNum(p?.value))
}

// ---- legends -------------------------------------------------------------
const lastBar = computed(() => {
  const bars = validBars(props.ohlcv)
  return bars[bars.length - 1]
})
const shown = computed(() => hover.value ?? (lastBar.value
  ? { open: lastBar.value.open, high: lastBar.value.high, low: lastBar.value.low, close: lastBar.value.close }
  : null))
const chg = computed(() => (shown.value ? shown.value.close - shown.value.open : 0))
const chgPct = computed(() => (shown.value && shown.value.open ? (chg.value / shown.value.open) * 100 : 0))
const enabledEmas = computed(() =>
  EMA_DEFS.filter(e => props.indicatorState?.[e.key])
    .map(e => ({ ...e, value: lastVal(props.indicators?.[e.key]) })),
)

// ---- FVG canvas overlay --------------------------------------------------
function drawFvg() {
  const cvs = fvgCanvas.value, cont = container.value
  if (!chart || !series || !cvs || !cont) return
  const w = cont.clientWidth, h = cont.clientHeight, dpr = window.devicePixelRatio || 1
  if (cvs.width !== w * dpr || cvs.height !== h * dpr) {
    cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + 'px'; cvs.style.height = h + 'px'
  }
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)
  if (!props.indicatorState?.fvg || !props.indicators?.fvg) return
  const ts = chart.timeScale()
  const rightEdge = ts.width()
  for (const g of props.indicators.fvg) {
    const x1c = ts.timeToCoordinate(g.time)
    const x1 = x1c == null ? 0 : (x1c as number)
    const x2 = rightEdge
    const yTc = series.priceToCoordinate(g.top), yBc = series.priceToCoordinate(g.bottom)
    if (yTc == null || yBc == null) continue
    const yT = yTc as number, yB = yBc as number
    const col = g.type === 'bullish' ? '46,189,133' : '246,70,93'
    ctx.fillStyle = `rgba(${col},0.13)`
    ctx.fillRect(x1, Math.min(yT, yB), Math.max(x2 - x1, 2), Math.abs(yB - yT))
    ctx.strokeStyle = `rgba(${col},0.45)`
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(x1, yT); ctx.lineTo(x2, yT); ctx.moveTo(x1, yB); ctx.lineTo(x2, yB)
    ctx.stroke()
    ctx.setLineDash([])
  }
}
function scheduleFvg() {
  if (raf) return
  raf = requestAnimationFrame(() => { raf = 0; drawFvg() })
}

// ---- price lines (fib + S/R) --------------------------------------------
function clearLines(lines: IPriceLine[]) {
  if (!series) return
  for (const l of lines) series.removePriceLine(l)
}
function applyFibonacci() {
  if (!series || !props.indicators?.fibonacci) return
  clearLines(fibLines); fibLines = []
  for (const [ratio, price] of Object.entries(props.indicators.fibonacci.levels)) {
    fibLines.push(series.createPriceLine({
      price, color: 'rgba(255,122,24,0.5)', lineWidth: 1, lineStyle: 1,
      axisLabelVisible: true, title: 'fib ' + ratio,
    }))
  }
}
function applySupportResistance() {
  if (!series || !props.indicators?.support_resistance) return
  clearLines(srLines); srLines = []
  for (const level of props.indicators.support_resistance) {
    srLines.push(series.createPriceLine({
      price: level, color: 'rgba(154,160,172,0.55)', lineWidth: 1, lineStyle: 2,
      axisLabelVisible: true, title: '',
    }))
  }
}

function syncEma(key: typeof EMA_DEFS[number]['key']) {
  const s = emaSeries[key]
  if (!s) return
  const on = !!props.indicatorState?.[key]
  const data = linePoints(props.indicators?.[key])
  if (on && data.length) { s.setData(data); s.applyOptions({ visible: true }) }
  else s.applyOptions({ visible: false })
}

onMounted(() => {
  if (!container.value) return
  chart = createChart(container.value, {
    ...baseChartOptions,
    width: container.value.clientWidth,
    height: container.value.clientHeight,
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: { color: 'rgba(255,255,255,0.28)', width: 1, style: 2, labelBackgroundColor: '#2a2d36' },
      horzLine: { color: 'rgba(255,255,255,0.28)', width: 1, style: 2, labelBackgroundColor: '#2a2d36' },
    },
  })

  series = chart.addSeries(CandlestickSeries, {
    upColor: CHART_COLORS.up, downColor: CHART_COLORS.down,
    wickUpColor: CHART_COLORS.up, wickDownColor: CHART_COLORS.down,
    borderVisible: false,
  })

  volSeries = chart.addSeries(HistogramSeries, {
    priceScaleId: 'vol', priceLineVisible: false, lastValueVisible: false,
  })
  chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.86, bottom: 0 } })

  for (const e of EMA_DEFS) {
    emaSeries[e.key] = chart.addSeries(LineSeries, {
      color: e.color, lineWidth: 2, priceLineVisible: false,
      lastValueVisible: false, crosshairMarkerVisible: false, visible: false,
    })
  }

  if (props.ohlcv.length) {
    series.setData(toBars(props.ohlcv))
    setVolume()
    chart.timeScale().fitContent()
  }

  chart.timeScale().subscribeVisibleLogicalRangeChange((rng) => {
    if (!syncingOut) emit('range-change', rng)
    scheduleFvg()
  })

  chart.subscribeCrosshairMove((param) => {
    if (!param?.time || !param.point || param.point.x < 0) { hover.value = null; return }
    const d = series ? param.seriesData.get(series) as CandlestickData | undefined : undefined
    if (d) hover.value = { open: d.open, high: d.high, low: d.low, close: d.close }
  })

  observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect
    chart?.resize(width, height)
    scheduleFvg()
  })
  observer.observe(container.value)

  // initial overlay state
  for (const e of EMA_DEFS) syncEma(e.key)
  if (props.indicatorState?.fibonacci) applyFibonacci()
  if (props.indicatorState?.supportResistance) applySupportResistance()
  scheduleFvg()
})

function setVolume() {
  if (!volSeries) return
  volSeries.setData(validBars(props.ohlcv).map(b => ({
    time: b.time, value: isNum(b.volume) ? b.volume : 0,
    color: b.close >= b.open ? 'rgba(46,189,133,0.22)' : 'rgba(246,70,93,0.22)',
  })))
}

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  observer?.disconnect()
  chart?.remove()
  chart = null; series = null; volSeries = null; observer = null
  fibLines = []; srLines = []
})

// data changes (symbol / period switch)
watch(() => props.ohlcv, (bars) => {
  if (!series || !chart) return
  series.setData(toBars(bars))
  setVolume()
  chart.timeScale().fitContent()
})

watch(() => props.indicators, () => {
  for (const e of EMA_DEFS) syncEma(e.key)
  if (props.indicatorState?.fibonacci) applyFibonacci()
  if (props.indicatorState?.supportResistance) applySupportResistance()
  scheduleFvg()
})

// individual toggle watchers
for (const e of EMA_DEFS) {
  watch(() => props.indicatorState?.[e.key], () => syncEma(e.key))
}
watch(() => props.indicatorState?.fibonacci, (on) => {
  if (on) applyFibonacci()
  else { clearLines(fibLines); fibLines = [] }
})
watch(() => props.indicatorState?.supportResistance, (on) => {
  if (on) applySupportResistance()
  else { clearLines(srLines); srLines = [] }
})
watch(() => props.indicatorState?.fvg, scheduleFvg)

function resetZoom() {
  chart?.timeScale().fitContent()
}
// Apply an external logical range (one-way sync from a sibling chart is not used
// here, but resetZoom is exposed for the header reset button).
defineExpose({ resetZoom })
</script>

<template>
  <div class="chart-main-wrap">
    <div ref="container" class="chart-main" />
    <canvas ref="fvgCanvas" class="fvg-overlay" />

    <div v-if="shown" class="ohlc-legend">
      <span class="oh-sym">{{ symbol }}</span>
      <span class="oh-per">· {{ period.toUpperCase() }} · 1D</span>
      <span class="oh-i"><em>O</em>{{ fmtPrice(shown.open) }}</span>
      <span class="oh-i"><em>H</em>{{ fmtPrice(shown.high) }}</span>
      <span class="oh-i"><em>L</em>{{ fmtPrice(shown.low) }}</span>
      <span class="oh-i"><em>C</em>{{ fmtPrice(shown.close) }}</span>
      <span class="oh-chg" :class="chg >= 0 ? 'up' : 'down'">
        {{ fmtSigned(chg) }} ({{ fmtPct(chgPct) }})
      </span>
    </div>

    <div class="ema-legend">
      <span v-for="e in enabledEmas" :key="e.key" class="ema-chip">
        <span class="dot" :style="{ background: e.color }" />{{ e.label }}
        <b>{{ fmtPrice(e.value) }}</b>
      </span>
    </div>

    <div v-if="loading" class="absolute inset-0 z-10">
      <ChartSkeleton />
    </div>
  </div>
</template>
