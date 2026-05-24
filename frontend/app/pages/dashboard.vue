<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-highlighted">Dashboard</h1>
        <p class="text-sm text-muted mt-0.5">Portfolio overview &amp; performance</p>
      </div>
    </div>

    <!-- PnL Chart -->
    <UCard>
      <template #header>
        <p class="text-sm font-medium text-muted">Profit &amp; Loss — Last 7 Days</p>
      </template>
      <PnLChart :data="pnlData" :loading="pnlLoading" />
    </UCard>

    <!-- Stat cards row -->
    <div class="grid grid-cols-4 gap-4">
      <StatCard
        label="Focusing Stock"
        :value="stats?.focusedSym ?? '—'"
        :sub="stats?.focusedPrice != null ? `$${stats.focusedPrice.toFixed(2)}` : ''"
        :loading="statsLoading"
      />
      <StatCard
        label="Today PnL"
        :value="stats ? formatPnl(stats.todayPnl) : '—'"
        :sub="stats ? `${stats.todayPnlPct >= 0 ? '+' : ''}${stats.todayPnlPct.toFixed(2)}%` : ''"
        :positive="stats ? stats.todayPnl >= 0 : undefined"
        :loading="statsLoading"
      />
      <StatCard label="Total Value" :value="stats ? `$${stats.totalValue.toLocaleString()}` : '—'" :loading="statsLoading" />
      <StatCard label="Total Cost" :value="stats ? `$${stats.totalCost.toLocaleString()}` : '—'" :loading="statsLoading" />
    </div>

    <!-- Detail cards row -->
    <div class="grid grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <p class="text-sm font-medium text-muted">Detail Card 1</p>
        </template>
        <p class="text-muted text-sm">Reserved</p>
      </UCard>

      <UCard>
        <template #header>
          <p class="text-sm font-medium text-muted">Focusing Stock Info</p>
        </template>
        <FocusStockTable />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const stockApi = useStockApi()

// ── PnL chart data ────────────────────────────────────────────────────────────
const pnlLoading = ref(true)
const pnlData = ref<{ date: string; pnl: number }[]>([])

// ── Stats ─────────────────────────────────────────────────────────────────────
const statsLoading = ref(true)
const stats = ref<{
  focusedSym: string | null
  focusedPrice: number | null
  todayPnl: number
  todayPnlPct: number
  totalValue: number
  totalCost: number
} | null>(null)

function formatPnl(val: number) {
  return `${val >= 0 ? '+' : ''}$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

onMounted(async () => {
  const [pnlRes, statsRes] = await Promise.allSettled([
    stockApi.getPortfolioPnl('7d'),
    stockApi.getPortfolioStats(),
  ])

  if (pnlRes.status === 'fulfilled') {
    pnlData.value = pnlRes.value.data
  }
  pnlLoading.value = false

  if (statsRes.status === 'fulfilled') {
    stats.value = statsRes.value
  }
  statsLoading.value = false
})
</script>
