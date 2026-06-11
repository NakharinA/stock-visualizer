<script setup lang="ts">
import type { IndicatorsData, OHLCVBar, OverviewItem } from '~/types/api'
import type { LogicalRange } from 'lightweight-charts'
import { fmtPrice } from '~/utils/format'

const route = useRoute()
const { fetchStock, fetchOverview } = useStockApi()
const { indicators: indicatorState } = useIndicatorState()
const { symbols, addSymbol, removeSymbol } = useWatchlist()

const symbol = computed(() => ((route.params.symbol as string) || '').toUpperCase())

const PERIODS = [
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '6M', value: '6mo' },
  { label: '3M', value: '3mo' },
  { label: '1M', value: '1mo' },
  { label: '1W', value: '1wk' },
] as const

const period = ref<string>('3mo')
const ohlcv = ref<OHLCVBar[]>([])
const indicators = ref<IndicatorsData | undefined>(undefined)
const headerRow = ref<OverviewItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const activeSubpanelTab = ref<'macd' | 'rsi' | 'stochrsi'>('macd')
const chartRange = ref<LogicalRange | null>(null)
const chartRef = ref<{ resetZoom: () => void } | null>(null)

const inWatch = computed(() => symbols.value.includes(symbol.value))

// Keep the active oscillator tab pointing at an enabled indicator.
watch(indicatorState, (state) => {
  const enabled = { macd: state.macd, rsi: state.rsi, stochrsi: state.stochRsi }
  if (enabled[activeSubpanelTab.value]) return
  if (state.macd) activeSubpanelTab.value = 'macd'
  else if (state.rsi) activeSubpanelTab.value = 'rsi'
  else if (state.stochRsi) activeSubpanelTab.value = 'stochrsi'
}, { deep: true })

onMounted(() => {
  period.value = localStorage.getItem('sv.period') || '3mo'
  if (!symbol.value) {
    navigateTo('/stock/' + (localStorage.getItem('sv.last') || 'AAPL'), { replace: true })
  }
})

watch(period, (p) => { if (import.meta.client) localStorage.setItem('sv.period', p) })
watch(symbol, (s) => { if (import.meta.client && s) localStorage.setItem('sv.last', s) }, { immediate: true })

async function loadChart() {
  if (!symbol.value) return
  loading.value = true
  error.value = null
  try {
    const [data, rows] = await Promise.all([
      fetchStock(symbol.value, period.value),
      fetchOverview([symbol.value]).catch(() => [] as OverviewItem[]),
    ])
    ohlcv.value = data.ohlcv
    indicators.value = data.indicators
    headerRow.value = rows[0] ?? null
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode
    error.value = status === 404
      ? `Symbol '${symbol.value}' not found`
      : 'Failed to load chart data. Please try again.'
    ohlcv.value = []
    indicators.value = undefined
  } finally {
    loading.value = false
  }
}

watch([symbol, period], loadChart, { immediate: true })

function toggleWatch() {
  if (!symbol.value) return
  if (inWatch.value) removeSymbol(symbol.value)
  else addSymbol(symbol.value)
}

// Fallback header values from the latest bar when the overview row is unavailable.
const headerPrice = computed(() => headerRow.value?.price ?? ohlcv.value[ohlcv.value.length - 1]?.close ?? 0)
const headerDiff = computed(() => headerRow.value?.diff_value ?? 0)
const headerPct = computed(() => headerRow.value?.diff_pct ?? 0)
</script>

<template>
  <div class="chartpage">
    <div class="chart-head">
      <div class="ch-id">
        <div class="ch-tick">
          <span class="ch-sym">{{ symbol }}</span>
          <button
            class="star-btn"
            :class="{ on: inWatch }"
            :title="inWatch ? 'In watchlist' : 'Add to watchlist'"
            aria-label="Toggle watchlist"
            @click="toggleWatch"
          >
            <UiAppIcon name="star" :size="16" />
          </button>
        </div>
        <div class="ch-name">
          {{ headerRow?.name || symbol }}
          <span v-if="headerRow?.sector" class="ch-sector">{{ headerRow.sector }}</span>
        </div>
      </div>

      <div class="ch-price">
        <span class="ch-last">${{ fmtPrice(headerPrice) }}</span>
        <UiDelta :value="headerDiff" :pct="headerPct" pill />
      </div>

      <div class="ch-periods">
        <button
          v-for="p in PERIODS"
          :key="p.value"
          class="seg"
          :class="{ active: period === p.value }"
          @click="period = p.value"
        >
          {{ p.label }}
        </button>
        <button class="icon-btn" title="Reset zoom" aria-label="Reset zoom" @click="chartRef?.resetZoom()">
          <UiAppIcon name="search" :size="15" />
        </button>
      </div>
    </div>

    <div class="chart-body">
      <div class="chart-col">
        <UAlert
          v-if="error"
          color="error"
          variant="soft"
          :description="error"
          icon="i-heroicons-exclamation-triangle"
          class="m-3"
          :actions="[{ label: 'Try again', color: 'error', variant: 'outline', onClick: loadChart }]"
        />

        <ChartCandleChart
          v-else
          ref="chartRef"
          :ohlcv="ohlcv"
          :indicators="indicators"
          :indicator-state="indicatorState"
          :loading="loading"
          :symbol="symbol"
          :period="period"
          @range-change="chartRange = $event"
        />

        <ChartIndicatorPanel
          v-if="indicators && !error"
          :indicators="indicators"
          :indicator-state="indicatorState"
          :active-tab="activeSubpanelTab"
          :loading="loading"
          :range="chartRange"
          @update:active-tab="activeSubpanelTab = $event"
        />
      </div>

      <ChartIndicatorToggle v-model="indicatorState" />
    </div>
  </div>
</template>
