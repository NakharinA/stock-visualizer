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
      <PnLChart />
    </UCard>

    <!-- Stat cards row -->
    <div class="grid grid-cols-4 gap-4">
      <StatCard
        label="Focusing Stock"
        :value="focusedStock?.sym ?? '—'"
        :sub="focusedStock ? `$${focusedStock.price.toFixed(2)}` : ''"
      />
      <StatCard
        label="Today PnL"
        value="+$1,240.50"
        sub="+3.12%"
        :positive="true"
      />
      <StatCard label="—" value="—" />
      <StatCard label="—" value="—" />
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

const watchlistStore = useWatchlistStore()
const focusedStock = computed(() => watchlistStore.focusedStock)
</script>
