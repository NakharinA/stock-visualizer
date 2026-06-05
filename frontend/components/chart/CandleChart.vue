<script setup lang="ts">
import { createChart, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, CandlestickData, IPriceLine } from 'lightweight-charts'
import type { OHLCVBar, IndicatorsData } from '~/types/api'
import type { IndicatorState } from '~/composables/useIndicatorState'

const props = defineProps<{
  ohlcv: OHLCVBar[]
  indicators?: IndicatorsData
  indicatorState?: IndicatorState
  loading?: boolean
}>()

const container = ref<HTMLDivElement>()
let chart: IChartApi | null = null
let series: ISeriesApi<'Candlestick'> | null = null
let observer: ResizeObserver | null = null

// EMA line series
let ema20Series: ISeriesApi<'Line'> | null = null
let ema50Series: ISeriesApi<'Line'> | null = null
let ema100Series: ISeriesApi<'Line'> | null = null
let ema200Series: ISeriesApi<'Line'> | null = null

// Price line refs for Fibonacci, S/R, and FVG
let fibLines: IPriceLine[] = []
let srLines: IPriceLine[] = []
let fvgLines: IPriceLine[] = []

function toBars(bars: OHLCVBar[]): CandlestickData[] {
  return bars.map(b => ({
    time: b.time,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
  }))
}

function clearPriceLines(lines: IPriceLine[]) {
  if (!series) return
  for (const line of lines) {
    series.removePriceLine(line)
  }
}

function applyFibonacci() {
  if (!series || !props.indicators?.fibonacci) return
  clearPriceLines(fibLines)
  fibLines = []
  const levels = props.indicators.fibonacci.levels
  for (const [ratio, price] of Object.entries(levels)) {
    fibLines.push(series.createPriceLine({
      price,
      color: '#f59e0b',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: ratio,
    }))
  }
}

function applySupportResistance() {
  if (!series || !props.indicators?.support_resistance) return
  clearPriceLines(srLines)
  srLines = []
  for (const level of props.indicators.support_resistance) {
    srLines.push(series.createPriceLine({
      price: level,
      color: 'rgba(255, 255, 255, 0.6)',
      lineWidth: 1,
      lineStyle: 0, // Solid
      axisLabelVisible: true,
      title: '',
    }))
  }
}

function applyFVG() {
  if (!series || !props.indicators?.fvg) return
  clearPriceLines(fvgLines)
  fvgLines = []
  for (const gap of props.indicators.fvg) {
    const color = gap.type === 'bullish' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
    fvgLines.push(series.createPriceLine({
      price: gap.top,
      color,
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: false,
      title: '',
    }))
    fvgLines.push(series.createPriceLine({
      price: gap.bottom,
      color,
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: false,
      title: '',
    }))
  }
}

onMounted(() => {
  if (!container.value) return

  chart = createChart(container.value, {
    width: container.value.clientWidth,
    height: container.value.clientHeight,
    layout: {
      background: { color: '#0f1117' },
      textColor: '#d1d5db',
    },
    grid: {
      vertLines: { color: '#1f2937' },
      horzLines: { color: '#1f2937' },
    },
    crosshair: { mode: CrosshairMode.Normal },
    timeScale: { borderColor: '#374151', timeVisible: true },
    handleScroll: {
      mouseWheel: false,
      pressedMouseMove: false,
      horzTouchDrag: false,
      vertTouchDrag: false,
    },
    handleScale: {
      mouseWheel: true,
      pinch: true,
      axisDoubleClickReset: true,
    },
  })

  series = chart.addSeries(CandlestickSeries, {
    upColor: '#22c55e',
    downColor: '#ef4444',
    borderUpColor: '#22c55e',
    borderDownColor: '#ef4444',
    wickUpColor: '#22c55e',
    wickDownColor: '#ef4444',
  })

  if (props.ohlcv.length) {
    series.setData(toBars(props.ohlcv))
    chart.timeScale().fitContent()
  }

  // Create all 4 EMA series upfront (hidden by default)
  ema20Series = chart.addSeries(LineSeries, {
    color: '#3b82f6',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
    visible: false,
  })
  ema50Series = chart.addSeries(LineSeries, {
    color: '#f97316',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
    visible: false,
  })
  ema100Series = chart.addSeries(LineSeries, {
    color: '#a855f7',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
    visible: false,
  })
  ema200Series = chart.addSeries(LineSeries, {
    color: '#ef4444',
    lineWidth: 1,
    priceLineVisible: false,
    lastValueVisible: false,
    visible: false,
  })

  observer = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect
    chart?.resize(width, height)
  })
  observer.observe(container.value)
})

onUnmounted(() => {
  observer?.disconnect()
  chart?.remove()
  chart = null
  series = null
  ema20Series = null
  ema50Series = null
  ema100Series = null
  ema200Series = null
  fibLines = []
  srLines = []
  fvgLines = []
  observer = null
})

// Update candlestick data when ohlcv prop changes
watch(
  () => props.ohlcv,
  (bars) => {
    if (!series || !chart) return
    series.setData(toBars(bars))
    chart.timeScale().fitContent()
  },
)

// Re-apply all active overlays when indicators data changes (period switch)
watch(
  () => props.indicators,
  () => {
    if (!props.indicatorState) return
    const state = props.indicatorState

    if (state.ema20 && ema20Series && props.indicators?.ema20)
      ema20Series.setData(props.indicators.ema20)
    if (state.ema50 && ema50Series && props.indicators?.ema50)
      ema50Series.setData(props.indicators.ema50)
    if (state.ema100 && ema100Series && props.indicators?.ema100)
      ema100Series.setData(props.indicators.ema100)
    if (state.ema200 && ema200Series && props.indicators?.ema200)
      ema200Series.setData(props.indicators.ema200)

    if (state.fibonacci) applyFibonacci()
    if (state.supportResistance) applySupportResistance()
    if (state.fvg) applyFVG()
  },
)

// EMA toggle watchers
watch(() => props.indicatorState?.ema20, (on) => {
  if (!ema20Series) return
  if (on && props.indicators?.ema20?.length) {
    ema20Series.setData(props.indicators.ema20)
    ema20Series.applyOptions({ visible: true })
  } else {
    ema20Series.applyOptions({ visible: false })
  }
})

watch(() => props.indicatorState?.ema50, (on) => {
  if (!ema50Series) return
  if (on && props.indicators?.ema50?.length) {
    ema50Series.setData(props.indicators.ema50)
    ema50Series.applyOptions({ visible: true })
  } else {
    ema50Series.applyOptions({ visible: false })
  }
})

watch(() => props.indicatorState?.ema100, (on) => {
  if (!ema100Series) return
  if (on && props.indicators?.ema100?.length) {
    ema100Series.setData(props.indicators.ema100)
    ema100Series.applyOptions({ visible: true })
  } else {
    ema100Series.applyOptions({ visible: false })
  }
})

watch(() => props.indicatorState?.ema200, (on) => {
  if (!ema200Series) return
  if (on && props.indicators?.ema200?.length) {
    ema200Series.setData(props.indicators.ema200)
    ema200Series.applyOptions({ visible: true })
  } else {
    ema200Series.applyOptions({ visible: false })
  }
})

// Fibonacci toggle
watch(() => props.indicatorState?.fibonacci, (on) => {
  if (on) {
    applyFibonacci()
  } else {
    clearPriceLines(fibLines)
    fibLines = []
  }
})

// Support/Resistance toggle
watch(() => props.indicatorState?.supportResistance, (on) => {
  if (on) {
    applySupportResistance()
  } else {
    clearPriceLines(srLines)
    srLines = []
  }
})

// FVG toggle
watch(() => props.indicatorState?.fvg, (on) => {
  if (on) {
    applyFVG()
  } else {
    clearPriceLines(fvgLines)
    fvgLines = []
  }
})
</script>

<template>
  <div class="relative w-full h-full">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-[#0f1117] z-10">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-gray-400 w-8 h-8" />
    </div>
    <div ref="container" class="w-full h-full" />
  </div>
</template>
