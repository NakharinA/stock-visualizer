<script setup lang="ts">
import type { Candle, IndicatorSeries, Interval, Period, IndicatorType, EmaLength } from '~/types'

const route = useRoute()
const ticker = computed(() => String(route.params.ticker).toUpperCase())

const { fetchOHLCV } = useStockData()
const { compute } = useIndicator()
const toast = useToast()

// ─── Selectors ───────────────────────────────────────────────────────────────
const INTERVALS: { label: string; value: Interval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1wk' },
  { label: '1Mo', value: '1mo' },
]

const PERIODS: { label: string; value: Period }[] = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1Mo', value: '1mo' },
  { label: '3Mo', value: '3mo' },
  { label: '6Mo', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '2Y', value: '2y' },
  { label: '5Y', value: '5y' },
]

const selectedInterval = ref<Interval>('1d')
const selectedPeriod = ref<Period>('6mo')

// ─── Data ────────────────────────────────────────────────────────────────────
const candles = ref<Candle[]>([])
const loadingCandles = ref(false)

const lastCandle = computed(() => candles.value.at(-1) ?? null)
const prevCandle = computed(() => candles.value.at(-2) ?? null)
const priceChange = computed(() => {
  if (!lastCandle.value || !prevCandle.value) return null
  return lastCandle.value.close - prevCandle.value.close
})
const priceChangePct = computed(() => {
  if (!priceChange.value || !prevCandle.value?.close) return null
  return (priceChange.value / prevCandle.value.close) * 100
})

const loadCandles = async () => {
  loadingCandles.value = true
  indicatorData.value = {}
  try {
    const res = await fetchOHLCV(ticker.value, selectedInterval.value, selectedPeriod.value)
    candles.value = res.candles
    await computeAllIndicators()
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: `Failed to load data for ${ticker.value}`, life: 3000 })
    candles.value = []
  } finally {
    loadingCandles.value = false
  }
}

// ─── Indicators ──────────────────────────────────────────────────────────────
const EMA_LENGTHS: EmaLength[] = [20, 50, 100, 200]
const activeEmas = ref<Set<EmaLength>>(new Set([20, 50]))
const activeIndicators = ref<Set<IndicatorType>>(new Set(['RSI', 'VOLUME']))

const indicatorData = ref<Record<string, IndicatorSeries[]>>({})

const toggleEma = (len: EmaLength) => {
  if (activeEmas.value.has(len)) activeEmas.value.delete(len)
  else activeEmas.value.add(len)
}

const toggleIndicator = (type: IndicatorType) => {
  if (activeIndicators.value.has(type)) activeIndicators.value.delete(type)
  else activeIndicators.value.add(type)
}

const emaOverlays = computed(() =>
  EMA_LENGTHS.filter((l) => activeEmas.value.has(l))
    .map((l) => ({ length: l, series: (indicatorData.value[`EMA_${l}`] ?? [])[0] }))
    .filter((e) => !!e.series),
)

const computeAllIndicators = async () => {
  if (!candles.value.length) return
  const tasks: Promise<void>[] = []

  for (const len of EMA_LENGTHS) {
    tasks.push(
      compute('EMA', candles.value, { length: len }).then((res) => {
        indicatorData.value[`EMA_${len}`] = res.series
      }),
    )
  }

  const subIndicators: Array<{ type: string; params?: Record<string, unknown> }> = [
    { type: 'RSI' },
    { type: 'STOCHRSI' },
    { type: 'MACD' },
    { type: 'ZSCORE' },
  ]

  for (const { type, params } of subIndicators) {
    tasks.push(
      compute(type, candles.value, params ?? {}).then((res) => {
        indicatorData.value[type] = res.series
      }),
    )
  }

  await Promise.allSettled(tasks)
}

// Volume series derived from candles (not from backend)
const volumeSeries = computed<IndicatorSeries[]>(() => {
  if (!candles.value.length) return []
  return [
    {
      name: 'Volume',
      time: candles.value.map((c) => c.time),
      values: candles.value.map((c) => c.volume),
    },
  ]
})

const INDICATOR_CONFIG: Record<IndicatorType, { label: string; height: number }> = {
  RSI: { label: 'RSI (14)', height: 140 },
  STOCHRSI: { label: 'Stochastic RSI', height: 140 },
  MACD: { label: 'MACD (12, 26, 9)', height: 150 },
  ZSCORE: { label: 'Z-Score (20)', height: 130 },
  VOLUME: { label: 'Volume', height: 110 },
}

watch([selectedInterval, selectedPeriod], loadCandles)
onMounted(loadCandles)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="stock-header">
      <div class="stock-header-left">
        <NuxtLink to="/stocks" class="back-link">
          <i class="pi pi-arrow-left" /> Watchlist
        </NuxtLink>
        <h1 class="page-title" style="margin-top: 0.25rem">{{ ticker }}</h1>
        <div v-if="lastCandle" class="price-row">
          <span class="price">${{ lastCandle.close.toFixed(2) }}</span>
          <span v-if="priceChange != null" :class="['change-badge', priceChange >= 0 ? 'positive' : 'negative']">
            {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}
            ({{ priceChangePct?.toFixed(2) }}%)
          </span>
        </div>
      </div>

      <!-- Interval + Period selectors -->
      <div class="selectors">
        <div class="selector-group">
          <span class="selector-label">Interval</span>
          <div class="selector-buttons">
            <button
              v-for="opt in INTERVALS"
              :key="opt.value"
              :class="['sel-btn', { active: selectedInterval === opt.value }]"
              @click="selectedInterval = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
        <div class="selector-group">
          <span class="selector-label">Period</span>
          <div class="selector-buttons">
            <button
              v-for="opt in PERIODS"
              :key="opt.value"
              :class="['sel-btn', { active: selectedPeriod === opt.value }]"
              @click="selectedPeriod = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- EMA + Indicator toggles -->
    <div class="toggles-row">
      <div class="toggle-group">
        <span class="toggle-label">EMA</span>
        <button
          v-for="len in EMA_LENGTHS"
          :key="len"
          :class="['toggle-btn', { active: activeEmas.has(len) }]"
          @click="toggleEma(len)"
        >{{ len }}</button>
      </div>
      <div class="toggle-group">
        <span class="toggle-label">Indicators</span>
        <button
          v-for="(cfg, type) in INDICATOR_CONFIG"
          :key="type"
          :class="['toggle-btn', { active: activeIndicators.has(type as IndicatorType) }]"
          @click="toggleIndicator(type as IndicatorType)"
        >{{ type === 'STOCHRSI' ? 'StochRSI' : type === 'ZSCORE' ? 'Z-Score' : type }}</button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loadingCandles" style="text-align: center; padding: 4rem; color: var(--p-text-muted-color)">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem" />
      <p>Loading data…</p>
    </div>

    <!-- Charts -->
    <template v-else-if="candles.length">
      <ChartCandlestickPane :candles="candles" :ema-overlays="emaOverlays" />

      <ChartIndicatorPane
        v-if="activeIndicators.has('VOLUME')"
        label="Volume"
        indicator-type="VOLUME"
        :series-list="volumeSeries"
        :height="110"
      />

      <ChartIndicatorPane
        v-for="type in (['RSI', 'STOCHRSI', 'MACD', 'ZSCORE'] as IndicatorType[])"
        :key="type"
        v-show="activeIndicators.has(type)"
        :label="INDICATOR_CONFIG[type].label"
        :indicator-type="type"
        :series-list="indicatorData[type] ?? []"
        :height="INDICATOR_CONFIG[type].height"
      />
    </template>

    <div v-else style="text-align: center; padding: 4rem; color: var(--p-text-muted-color)">
      No data available for <strong>{{ ticker }}</strong> with this interval/period combination.
    </div>
  </div>
</template>

<style scoped>
.stock-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stock-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.back-link {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.back-link:hover { color: var(--p-primary-color); }

.price-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.price {
  font-size: 1.75rem;
  font-weight: 700;
}

.change-badge {
  font-size: 0.95rem;
  font-weight: 600;
}

.selectors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.selector-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selector-label, .toggle-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 55px;
}

.selector-buttons, .toggle-group {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.toggles-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.sel-btn, .toggle-btn {
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--p-surface-300, #cbd5e1);
  border-radius: 5px;
  background: transparent;
  font-size: 0.78rem;
  cursor: pointer;
  color: var(--p-text-color);
  transition: all 0.15s;
}

.sel-btn:hover, .toggle-btn:hover {
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.sel-btn.active, .toggle-btn.active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: #fff;
}
</style>
