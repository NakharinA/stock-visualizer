<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-[#e6edf3]">Dashboard</h1>
        <p class="text-sm text-[#8b949e] mt-0.5">Portfolio overview &amp; performance</p>
      </div>
    </div>

    <!-- PnL Chart -->
    <UCard class="bg-[#161b22] border-[#30363d]">
      <template #header>
        <p class="text-sm font-medium text-[#8b949e]">Profit &amp; Loss — Last 7 Days</p>
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
      <UCard class="bg-[#161b22] border-[#30363d]">
        <template #header>
          <p class="text-sm font-medium text-[#8b949e]">Detail Card 1</p>
        </template>
        <p class="text-[#8b949e] text-sm">Reserved</p>
      </UCard>

      <UCard class="bg-[#161b22] border-[#30363d]">
        <template #header>
          <p class="text-sm font-medium text-[#8b949e]">Focusing Stock Info</p>
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
