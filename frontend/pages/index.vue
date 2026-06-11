<script setup lang="ts">
import type { OverviewItem } from '~/types/api'
import { fmtPrice } from '~/utils/format'
import { DASHBOARD_INDICES, MOVERS_UNIVERSE } from '~/utils/symbols'

const { fetchOverview } = useStockApi()
const { symbols } = useWatchlist()

const rows = ref<OverviewItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  const set = Array.from(new Set([...DASHBOARD_INDICES, ...MOVERS_UNIVERSE, ...symbols.value]))
  loading.value = true
  error.value = null
  try {
    rows.value = await fetchOverview(set)
  } catch {
    error.value = 'Failed to load market data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Fires once on mount (watchlist still empty → indices + universe) and again once
// useWatchlist hydrates from localStorage.
watch(symbols, load, { immediate: true, deep: true })

const bySym = computed(() => Object.fromEntries(rows.value.map(r => [r.symbol, r])))
const indexCards = computed(() => DASHBOARD_INDICES.map(s => bySym.value[s]).filter(Boolean) as OverviewItem[])
const universeRows = computed(() => MOVERS_UNIVERSE.map(s => bySym.value[s]).filter(Boolean) as OverviewItem[])
const gainers = computed(() => [...universeRows.value].sort((a, b) => b.diff_pct - a.diff_pct).slice(0, 5))
const losers = computed(() => [...universeRows.value].sort((a, b) => a.diff_pct - b.diff_pct).slice(0, 5))
const wlRows = computed(() => symbols.value.map(s => bySym.value[s]).filter(Boolean) as OverviewItem[])

const now = new Date()
const hour = now.getHours()
const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
</script>

<template>
  <div class="page dash">
    <div class="dash-hero">
      <div>
        <h1 class="h1">{{ greet }}</h1>
        <p class="sub">Markets snapshot · <span class="mono">{{ dateStr }}</span> · live data</p>
      </div>
      <div class="mkt-status"><span class="live-dot" />Markets open</div>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      class="mb-5"
      :actions="[{ label: 'Try again', color: 'error', variant: 'outline', onClick: load }]"
    />

    <!-- Index cards -->
    <div class="idx-row">
      <button
        v-for="r in indexCards"
        :key="r.symbol"
        class="idx-card"
        @click="navigateTo(`/stock/${r.symbol}`)"
      >
        <div class="idx-top">
          <span class="idx-sym">{{ r.symbol }}</span>
          <UiDelta :pct="r.diff_pct" />
        </div>
        <div class="idx-px">${{ fmtPrice(r.price) }}</div>
        <div class="idx-spark"><UiSparkline :values="r.spark" :width="150" :height="40" /></div>
      </button>
    </div>

    <div class="dash-grid">
      <!-- Watchlist -->
      <section class="panel">
        <div class="panel-h">
          <h2>Your watchlist</h2>
          <button class="link-btn" @click="navigateTo('/overview')">
            Open overview <UiAppIcon name="chevron" :size="14" />
          </button>
        </div>
        <div v-if="wlRows.length === 0" class="empty">
          No symbols yet. Add some from the Overview page.
        </div>
        <div v-else class="wl-grid">
          <button
            v-for="r in wlRows"
            :key="r.symbol"
            class="wl-card"
            @click="navigateTo(`/stock/${r.symbol}`)"
          >
            <div class="wl-l">
              <div class="wl-sym">{{ r.symbol }}</div>
              <div class="wl-name">{{ r.name }}</div>
            </div>
            <div class="wl-spark"><UiSparkline :values="r.spark" :width="84" :height="30" /></div>
            <div class="wl-r">
              <div class="wl-px">${{ fmtPrice(r.price) }}</div>
              <UiDelta :pct="r.diff_pct" />
            </div>
          </button>
        </div>
      </section>

      <!-- Movers -->
      <section class="panel">
        <div class="panel-h"><h2>Movers today</h2></div>
        <div class="movers">
          <div class="mv-col">
            <div class="mv-h up">Gainers</div>
            <button v-for="r in gainers" :key="r.symbol" class="mv-row" @click="navigateTo(`/stock/${r.symbol}`)">
              <span class="mv-sym">{{ r.symbol }}</span>
              <span class="mv-spark"><UiSparkline :values="r.spark" :width="46" :height="18" :fill="false" /></span>
              <span class="mv-px">{{ fmtPrice(r.price) }}</span>
              <UiDelta :pct="r.diff_pct" :show-arrow="false" />
            </button>
          </div>
          <div class="mv-col">
            <div class="mv-h down">Losers</div>
            <button v-for="r in losers" :key="r.symbol" class="mv-row" @click="navigateTo(`/stock/${r.symbol}`)">
              <span class="mv-sym">{{ r.symbol }}</span>
              <span class="mv-spark"><UiSparkline :values="r.spark" :width="46" :height="18" :fill="false" /></span>
              <span class="mv-px">{{ fmtPrice(r.price) }}</span>
              <UiDelta :pct="r.diff_pct" :show-arrow="false" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
