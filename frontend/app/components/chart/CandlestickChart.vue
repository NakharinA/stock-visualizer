<script setup lang="ts">
import { createChart, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import type { DrawingPoint } from '~/types'
import { TrendlinePrimitive } from '~/components/drawing/TrendlinePrimitive'
import { FVGBoxPrimitive } from '~/components/drawing/FVGBoxPrimitive'

const emit = defineEmits<{
  'chart-ready': [chart: IChartApi]
}>()

const chartStore = useChartStore()
const dStore = useDrawingsStore()

const chartContainer = ref<HTMLElement | null>(null)
let chart: IChartApi | null = null
let series: ISeriesApi<'Candlestick'> | null = null
const primitiveMap = new Map<string, TrendlinePrimitive | FVGBoxPrimitive>()

function toDrawingPoint(e: MouseEvent): DrawingPoint | null {
  if (!chart || !series || !chartContainer.value) return null
  const rect = chartContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const time = chart.timeScale().coordinateToTime(x)
  const price = series.coordinateToPrice(y)
  if (time === null || price === null) return null
  return { time: time as number, price }
}

function onMouseDown(e: MouseEvent) {
  if (dStore.activeTool === 'none') return
  const pt = toDrawingPoint(e)
  if (!pt) return
  if (dStore.activeTool === 'hline') {
    dStore.startDraft(pt)
    dStore.updateDraft({ time: pt.time + 9_999_999, price: pt.price })
    dStore.commitDraft()
  } else {
    dStore.startDraft(pt)
  }
}

function onMouseMove(e: MouseEvent) {
  if (!dStore.draft) return
  const pt = toDrawingPoint(e)
  if (pt) dStore.updateDraft(pt)
}

function onMouseUp(e: MouseEvent) {
  if (!dStore.draft) return
  const pt = toDrawingPoint(e)
  if (pt) dStore.updateDraft(pt)
  dStore.commitDraft()
}

onMounted(() => {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: '#0f1117' },
      textColor: '#d1d4dc',
    },
    grid: {
      vertLines: { color: '#2a2d3a' },
      horzLines: { color: '#2a2d3a' },
    },
    crosshair: { mode: 1 },
    rightPriceScale: { borderColor: '#2a2d3a' },
    timeScale: { borderColor: '#2a2d3a', timeVisible: true },
    width: chartContainer.value.clientWidth,
    height: chartContainer.value.clientHeight,
  })

  series = chart.addSeries(CandlestickSeries, {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
  })

  emit('chart-ready', chart)

  const ro = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.resize(chartContainer.value.clientWidth, chartContainer.value.clientHeight)
    }
  })
  ro.observe(chartContainer.value)

  chartContainer.value.addEventListener('mousedown', onMouseDown)
  chartContainer.value.addEventListener('mousemove', onMouseMove)
  chartContainer.value.addEventListener('mouseup', onMouseUp)

  chartStore.fetchCandles()
})

watch(
  () => chartStore.candles,
  (candles) => {
    if (!series || !candles.length) return
    series.setData(
      candles.map(c => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    )
    chart?.timeScale().fitContent()
  },
)

watch(
  [() => dStore.drawings, () => dStore.draft],
  ([drawings, draft]) => {
    if (!series) return
    const allDrawings = [...drawings, ...(draft ? [draft] : [])]
    const currentIds = new Set(allDrawings.map(d => d.id))

    for (const [id, primitive] of primitiveMap) {
      if (!currentIds.has(id)) {
        series.detachPrimitive(primitive)
        primitiveMap.delete(id)
      }
    }

    for (const drawing of allDrawings) {
      if (drawing.points.length < 2) continue
      if (primitiveMap.has(drawing.id)) {
        primitiveMap.get(drawing.id)!.update(drawing)
      } else {
        const primitive = drawing.tool === 'fvgbox'
          ? new FVGBoxPrimitive(drawing)
          : new TrendlinePrimitive(drawing)
        series.attachPrimitive(primitive)
        primitiveMap.set(drawing.id, primitive)
      }
    }
  },
  { deep: true },
)

onUnmounted(() => {
  if (chartContainer.value) {
    chartContainer.value.removeEventListener('mousedown', onMouseDown)
    chartContainer.value.removeEventListener('mousemove', onMouseMove)
    chartContainer.value.removeEventListener('mouseup', onMouseUp)
  }
  chart?.remove()
  chart = null
  series = null
})
</script>

<template>
  <div ref="chartContainer" class="chart-container" />
</template>

<style scoped>
.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}
</style>
