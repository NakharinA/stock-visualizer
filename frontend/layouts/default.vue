<script setup lang="ts">
import type { OverviewItem } from '~/types/api'
import { fmtPrice, fmtPct } from '~/utils/format'
import { INDEX_SYMBOLS } from '~/utils/symbols'

const route = useRoute()
const { fetchOverview } = useStockApi()

const lastSymbol = ref('AAPL')
onMounted(() => {
  lastSymbol.value = localStorage.getItem('sv.last') || 'AAPL'
})

const navItems = computed(() => [
  { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', to: '/', active: route.path === '/' },
  { key: 'chart', icon: 'chart', label: 'Chart', to: `/stock/${lastSymbol.value}`, active: route.path.startsWith('/stock') },
  { key: 'overview', icon: 'table', label: 'Watchlist', to: '/overview', active: route.path.startsWith('/overview') },
])

// Topbar index chips (SPY / QQQ) — live quotes from the overview endpoint.
const indices = ref<OverviewItem[]>([])
onMounted(async () => {
  try {
    indices.value = await fetchOverview(INDEX_SYMBOLS)
  } catch {
    indices.value = []
  }
})
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <button class="brand" aria-label="Ticker home" @click="navigateTo('/')">
        <span class="brand-mark"><UiAppIcon name="bolt" :size="18" :weight="2" /></span>
        <span class="brand-tx">Ticker</span>
      </button>
      <nav class="nav">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="nav-i"
          :class="{ active: item.active }"
          @click="navigateTo(item.to)"
        >
          <UiAppIcon :name="item.icon" :size="20" />
          <span>{{ item.label }}</span>
        </button>
      </nav>
      <div class="side-foot"><span class="dot-sim" />live</div>
    </aside>

    <div class="main">
      <header class="topbar">
        <TopbarSearch />
        <div class="idx-chips">
          <button
            v-for="r in indices"
            :key="r.symbol"
            class="idx-chip"
            @click="navigateTo(`/stock/${r.symbol}`)"
          >
            <span class="ic-sym">{{ r.symbol }}</span>
            <span class="ic-px mono">{{ fmtPrice(r.price) }}</span>
            <span class="ic-pct" :class="r.diff_pct >= 0 ? 'up' : 'down'">{{ fmtPct(r.diff_pct) }}</span>
          </button>
        </div>
      </header>
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>
