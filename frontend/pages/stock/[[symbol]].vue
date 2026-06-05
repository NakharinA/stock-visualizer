<script setup lang="ts">
import type { IndicatorsData, SearchResult } from '~/types/api'

const route = useRoute()
const { fetchStock, searchSymbols } = useStockApi()
const { indicators: indicatorState } = useIndicatorState()

const symbol = computed(() => (route.params.symbol as string) || '')

const activeSubpanelTab = ref<'macd' | 'rsi' | 'stochrsi'>('macd')

const subpanelVisible = computed(
  () => indicatorState.value.macd || indicatorState.value.rsi || indicatorState.value.stochRsi,
)

// When subpanel becomes visible, auto-select the first enabled tab
watch(subpanelVisible, (visible) => {
  if (!visible) return
  const state = indicatorState.value
  const active = activeSubpanelTab.value
  const isActiveEnabled
    = (active === 'macd' && state.macd)
      || (active === 'rsi' && state.rsi)
      || (active === 'stochrsi' && state.stochRsi)
  if (!isActiveEnabled) {
    if (state.macd) activeSubpanelTab.value = 'macd'
    else if (state.rsi) activeSubpanelTab.value = 'rsi'
    else activeSubpanelTab.value = 'stochrsi'
  }
})

// Redirect /stock → /stock/AAPL
onMounted(() => {
  if (!symbol.value) {
    navigateTo('/stock/AAPL', { replace: true })
  }
})

const PERIODS = [
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '6M', value: '6mo' },
  { label: '3M', value: '3mo' },
  { label: '1M', value: '1mo' },
  { label: '1W', value: '1wk' },
] as const

const period = ref<string>('3mo')
const ohlcv = ref<import('~/types/api').OHLCVBar[]>([])
const indicators = ref<IndicatorsData | undefined>(undefined)
const loading = ref(false)
const error = ref<string | null>(null)
const searchResults = ref<SearchResult[]>([])

async function loadChart() {
  if (!symbol.value) return
  loading.value = true
  error.value = null
  try {
    const data = await fetchStock(symbol.value, period.value)
    ohlcv.value = data.ohlcv
    indicators.value = data.indicators
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode
    if (status === 404) {
      error.value = `Symbol '${symbol.value}' not found`
    } else {
      error.value = 'Failed to load chart data. Please try again.'
    }
    ohlcv.value = []
    indicators.value = undefined
  } finally {
    loading.value = false
  }
}

async function handleSearch(query: string) {
  try {
    searchResults.value = await searchSymbols(query)
  } catch {
    searchResults.value = []
  }
}

function handleSelect(sym: string) {
  searchResults.value = []
  navigateTo(`/stock/${sym}`)
}

function selectPeriod(p: string) {
  period.value = p
}

watch([symbol, period], loadChart, { immediate: true })
</script>

<template>
  <div class="h-full flex flex-col p-6 gap-4">
    <!-- Header: search + tabs -->
    <div class="flex flex-col gap-3">
      <ChartSymbolSearch
        :symbol="symbol"
        :results="searchResults"
        @search="handleSearch"
        @select="handleSelect"
      />

      <div class="flex gap-1">
        <UButton
          v-for="tab in PERIODS"
          :key="tab.value"
          :label="tab.label"
          size="sm"
          :color="period === tab.value ? 'primary' : 'neutral'"
          :variant="period === tab.value ? 'solid' : 'ghost'"
          @click="selectPeriod(tab.value)"
        />
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Chart -->
    <div class="flex-1 min-h-0">
      <ChartCandleChart
        v-if="!error"
        :ohlcv="ohlcv"
        :indicators="indicators"
        :indicator-state="indicatorState"
        :loading="loading"
        class="h-full"
      />
    </div>

    <!-- Subpanel: MACD / RSI / Stoch RSI -->
    <ChartIndicatorPanel
      v-if="indicators"
      :indicators="indicators"
      :indicator-state="indicatorState"
      :active-tab="activeSubpanelTab"
      @update:active-tab="activeSubpanelTab = $event"
    />

    <!-- Indicator toggle panel -->
    <ChartIndicatorToggle
      v-model="indicatorState"
      class="shrink-0"
    />
  </div>
</template>
