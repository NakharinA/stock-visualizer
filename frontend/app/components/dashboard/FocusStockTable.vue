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
  { accessorKey: 'sym', header: 'Symbol' },
  { accessorKey: 'price', header: 'Last Price' },
  { accessorKey: 'change', header: 'Change' },
  { accessorKey: 'changePct', header: 'Change %' },
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
