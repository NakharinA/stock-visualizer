<template>
  <div ref="chartContainer" class="w-full h-full bg-[#0d1117]" />
</template>

<script setup lang="ts">
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickSeriesOptions,
  type SeriesOptionsMap,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'

const chartContainer = ref<HTMLElement | null>(null)
const watchlistStore = useWatchlistStore()
const indicatorStore = useIndicatorStore()
const chartStore = useChartStore()
const { getCandles } = useStockApi()

let chart: IChartApi | null = null
let candleSeries: ISeriesApi<'Candlestick'> | null = null
const overlaySeries = new Map<string, ISeriesApi<keyof SeriesOptionsMap>>()

const CHART_COLORS = {
  bg: '#0d1117',
  grid: '#21262d',
  text: '#8b949e',
  border: '#30363d',
  up: '#3fb950',
  down: '#f85149',
}

function initChart() {
  if (!chartContainer.value) return
  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: CHART_COLORS.bg },
      textColor: CHART_COLORS.text,
    },
    grid: {
      vertLines: { color: CHART_COLORS.grid },
      horzLines: { color: CHART_COLORS.grid },
    },
    crosshair: { mode: CrosshairMode.Normal },
    rightPriceScale: { borderColor: CHART_COLORS.border },
    timeScale: { borderColor: CHART_COLORS.border, timeVisible: true },
    handleScroll: true,
    handleScale: true,
  })

  candleSeries = chart.addCandlestickSeries({
    upColor: CHART_COLORS.up,
    downColor: CHART_COLORS.down,
    borderUpColor: CHART_COLORS.up,
    borderDownColor: CHART_COLORS.down,
    wickUpColor: CHART_COLORS.up,
    wickDownColor: CHART_COLORS.down,
  })

  // Resize observer
  const ro = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight,
      })
    }
  })
  ro.observe(chartContainer.value)

  onUnmounted(() => {
    ro.disconnect()
    chart?.remove()
  })
}

async function loadCandles() {
  if (!candleSeries) return
  const sym = watchlistStore.focusedSym
  const tf = chartStore.timeframe
  const data = await getCandles(sym, tf)
  chartStore.setCandleData(data)
  candleSeries.setData(
    data.map(d => ({
      time: d.time as unknown as import('lightweight-charts').Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    })),
  )
  chart?.timeScale().fitContent()
  syncOverlays()
}

function syncOverlays() {
  if (!chart) return
  const active = indicatorStore.overlayIndicators

  // Remove series no longer active
  for (const [id, series] of overlaySeries) {
    if (!active.has(id as any)) {
      chart.removeSeries(series)
      overlaySeries.delete(id)
    }
  }

  // Add new series
  const data = chartStore.candleData
  if (!data.length) return

  for (const id of active) {
    if (overlaySeries.has(id)) continue

    if (id === 'VOLUME') {
      const s = chart.addHistogramSeries({
        color: '#58a6ff',
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      })
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })
      s.setData(
        data.map(d => ({
          time: d.time as unknown as import('lightweight-charts').Time,
          value: d.volume,
          color: d.close >= d.open ? '#3fb95060' : '#f8514960',
        })),
      )
      overlaySeries.set(id, s as any)
    } else if (id === 'EMA20' || id === 'EMA50') {
      const period = id === 'EMA20' ? 20 : 50
      const s = chart.addLineSeries({
        color: id === 'EMA20' ? '#f0883e' : '#58a6ff',
        lineWidth: 1,
        priceLineVisible: false,
      })
      s.setData(calcEMA(data, period))
      overlaySeries.set(id, s as any)
    } else if (id === 'BB') {
      const bb = calcBB(data, 20)
      for (const [key, color] of [['upper', '#8b949e'], ['middle', '#58a6ff'], ['lower', '#8b949e']] as const) {
        const s = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lineStyle: key === 'middle' ? 0 : 2 })
        s.setData(bb[key])
        overlaySeries.set(`${id}_${key}`, s as any)
      }
    }
  }

  // Clean up BB sub-series when BB removed
  if (!active.has('BB')) {
    for (const key of ['BB_upper', 'BB_middle', 'BB_lower']) {
      const s = overlaySeries.get(key)
      if (s) { chart.removeSeries(s); overlaySeries.delete(key) }
    }
  }
}

// EMA calculation
function calcEMA(data: typeof chartStore.candleData, period: number) {
  const k = 2 / (period + 1)
  let ema = data[0]!.close
  return data.map((d, i) => {
    if (i === 0) { ema = d.close; return null }
    ema = d.close * k + ema * (1 - k)
    if (i < period - 1) return null
    return { time: d.time as unknown as import('lightweight-charts').Time, value: ema }
  }).filter(Boolean) as { time: import('lightweight-charts').Time; value: number }[]
}

// Bollinger Bands
function calcBB(data: typeof chartStore.candleData, period: number) {
  const upper: { time: import('lightweight-charts').Time; value: number }[] = []
  const middle: { time: import('lightweight-charts').Time; value: number }[] = []
  const lower: { time: import('lightweight-charts').Time; value: number }[] = []

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const mean = slice.reduce((s, d) => s + d.close, 0) / period
    const std = Math.sqrt(slice.reduce((s, d) => s + (d.close - mean) ** 2, 0) / period)
    const t = data[i]!.time as unknown as import('lightweight-charts').Time
    upper.push({ time: t, value: mean + 2 * std })
    middle.push({ time: t, value: mean })
    lower.push({ time: t, value: mean - 2 * std })
  }
  return { upper, middle, lower }
}

onMounted(() => {
  initChart()
  loadCandles()
})

watch(() => watchlistStore.focusedSym, loadCandles)
watch(() => chartStore.timeframe, loadCandles)
watch(() => [...indicatorStore.overlayIndicators], syncOverlays, { deep: true })
</script>
