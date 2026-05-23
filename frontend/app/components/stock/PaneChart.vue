<template>
  <div ref="el" class="w-full h-full" />
</template>

<script setup lang="ts">
import {
  createChart,
  LineSeries,
  type IChartApi,
  ColorType,
  CrosshairMode,
} from 'lightweight-charts'
import type { PaneIndicatorId } from '~/stores/useIndicatorStore'

const props = defineProps<{ indicatorId: PaneIndicatorId }>()
const el = ref<HTMLElement | null>(null)
const chartStore = useChartStore()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

let chart: IChartApi | null = null

const DARK = { bg: '#0d1117', grid: '#21262d', text: '#8b949e', border: '#30363d' }
const LIGHT = { bg: '#ffffff', grid: '#e5e7eb', text: '#57606a', border: '#d0d7de' }
const THEME = computed(() => isDark.value ? DARK : LIGHT)

const COLORS: Record<PaneIndicatorId, string> = {
  RSI: '#f0883e',
  MACD: '#58a6ff',
  STOCH: '#3fb950',
  CCI: '#bc8cff',
}

function buildSeries() {
  if (!chart) return
  const data = chartStore.candleData
  if (!data.length) return
  const closes = data.map(d => d.close)

  if (props.indicatorId === 'RSI') {
    const rsiData = calcRSI(data, 14)
    const s = chart.addSeries(LineSeries, { color: COLORS.RSI, lineWidth: 1, priceLineVisible: false })
    s.setData(rsiData)
  } else if (props.indicatorId === 'MACD') {
    const { macd, signal } = calcMACD(data)
    chart.addSeries(LineSeries, { color: '#58a6ff', lineWidth: 1, priceLineVisible: false }).setData(macd)
    chart.addSeries(LineSeries, { color: '#f85149', lineWidth: 1, priceLineVisible: false }).setData(signal)
  } else if (props.indicatorId === 'STOCH') {
    const stoch = calcStoch(data, 14)
    chart.addSeries(LineSeries, { color: COLORS.STOCH, lineWidth: 1, priceLineVisible: false }).setData(stoch)
  } else if (props.indicatorId === 'CCI') {
    const cci = calcCCI(data, 20)
    chart.addSeries(LineSeries, { color: COLORS.CCI, lineWidth: 1, priceLineVisible: false }).setData(cci)
  }

  chart?.timeScale().fitContent()
}

function calcRSI(data: typeof chartStore.candleData, period: number) {
  let gains = 0, losses = 0
  const result: { time: any; value: number }[] = []
  for (let i = 1; i < data.length; i++) {
    const diff = data[i]!.close - data[i - 1]!.close
    if (i <= period) {
      gains += Math.max(0, diff)
      losses += Math.max(0, -diff)
      if (i === period) {
        const rs = gains / period / (losses / period || 0.0001)
        result.push({ time: data[i]!.time, value: 100 - 100 / (1 + rs) })
      }
    } else {
      gains = (gains * (period - 1) + Math.max(0, diff)) / period
      losses = (losses * (period - 1) + Math.max(0, -diff)) / period
      const rs = gains / (losses || 0.0001)
      result.push({ time: data[i]!.time, value: 100 - 100 / (1 + rs) })
    }
  }
  return result as { time: import('lightweight-charts').Time; value: number }[]
}

function calcMACD(data: typeof chartStore.candleData) {
  const ema = (arr: number[], p: number) => {
    const k = 2 / (p + 1)
    let e = arr[0]!
    return arr.map((v, i) => { if (i > 0) e = v * k + e * (1 - k); return e })
  }
  const closes = data.map(d => d.close)
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = ema12.map((v, i) => v - ema26[i]!)
  const signalLine = ema(macdLine.slice(25), 9)
  const macd = data.slice(25).map((d, i) => ({ time: d.time as import('lightweight-charts').Time, value: macdLine[i + 25]! }))
  const signal = data.slice(34).map((d, i) => ({ time: d.time as import('lightweight-charts').Time, value: signalLine[i]! }))
  return { macd, signal }
}

function calcStoch(data: typeof chartStore.candleData, period: number) {
  return data.slice(period - 1).map((_, i) => {
    const slice = data.slice(i, i + period)
    const hi = Math.max(...slice.map(d => d.high))
    const lo = Math.min(...slice.map(d => d.low))
    const k = lo === hi ? 50 : ((data[i + period - 1]!.close - lo) / (hi - lo)) * 100
    return { time: data[i + period - 1]!.time as import('lightweight-charts').Time, value: k }
  })
}

function calcCCI(data: typeof chartStore.candleData, period: number) {
  return data.slice(period - 1).map((_, i) => {
    const slice = data.slice(i, i + period)
    const tp = slice.map(d => (d.high + d.low + d.close) / 3)
    const mean = tp.reduce((s, v) => s + v, 0) / period
    const md = tp.reduce((s, v) => s + Math.abs(v - mean), 0) / period
    return { time: data[i + period - 1]!.time as import('lightweight-charts').Time, value: (tp[tp.length - 1]! - mean) / (0.015 * (md || 1)) }
  })
}

onMounted(() => {
  if (!el.value) return
  chart = createChart(el.value, {
    layout: {
      background: { type: ColorType.Solid, color: THEME.value.bg },
      textColor: THEME.value.text,
    },
    grid: {
      vertLines: { color: THEME.value.grid },
      horzLines: { color: THEME.value.grid },
    },
    crosshair: { mode: CrosshairMode.Normal },
    rightPriceScale: { borderColor: THEME.value.border },
    timeScale: { borderColor: THEME.value.border, timeVisible: true },
  })

  const ro = new ResizeObserver(() => {
    if (chart && el.value) {
      chart.applyOptions({ width: el.value.clientWidth, height: el.value.clientHeight })
    }
  })
  ro.observe(el.value)
  onUnmounted(() => { ro.disconnect(); chart?.remove() })

  buildSeries()
})

watch(() => chartStore.candleData.length, buildSeries)
watch(isDark, () => {
  if (!chart) return
  const t = THEME.value
  chart.applyOptions({
    layout: {
      background: { type: ColorType.Solid, color: t.bg },
      textColor: t.text,
    },
    grid: {
      vertLines: { color: t.grid },
      horzLines: { color: t.grid },
    },
    rightPriceScale: { borderColor: t.border },
    timeScale: { borderColor: t.border },
  })
})
</script>
