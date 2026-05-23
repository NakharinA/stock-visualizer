<template>
  <UTable
    :data="rows"
    :columns="columns"
    class="text-sm"
  />
</template>

<script setup lang="ts">
const watchlistStore = useWatchlistStore()

const columns = [
  { key: 'sym', label: 'Symbol' },
  { key: 'price', label: 'Last Price' },
  { key: 'change', label: 'Change' },
  { key: 'changePct', label: 'Change %' },
]

const rows = computed(() =>
  watchlistStore.focusedStock
    ? [{
        sym: watchlistStore.focusedStock.sym,
        price: `$${watchlistStore.focusedStock.price.toFixed(2)}`,
        change: watchlistStore.focusedStock.change >= 0
          ? `+${watchlistStore.focusedStock.change.toFixed(2)}`
          : `${watchlistStore.focusedStock.change.toFixed(2)}`,
        changePct: watchlistStore.focusedStock.changePct >= 0
          ? `+${watchlistStore.focusedStock.changePct.toFixed(2)}%`
          : `${watchlistStore.focusedStock.changePct.toFixed(2)}%`,
      }]
    : [],
)
</script>
