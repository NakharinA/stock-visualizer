<template>
  <UModal v-model:open="open" title="Add Stock" :ui="{ content: 'bg-[#161b22] border border-[#30363d]' }">
    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="query"
          placeholder="Search by symbol or company name…"
          icon="i-lucide-search"
          autofocus
        />

        <div class="overflow-auto max-h-72">
          <UTable
            :data="filteredResults"
            :columns="columns"
          >
            <template #action-cell="{ row }">
              <UButton
                size="xs"
                :disabled="isAdded(row.sym)"
                :color="isAdded(row.sym) ? 'neutral' : 'primary'"
                :variant="isAdded(row.sym) ? 'subtle' : 'solid'"
                @click="addStock(row)"
              >
                {{ isAdded(row.sym) ? 'Added' : 'Add' }}
              </UButton>
            </template>
          </UTable>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const query = ref('')
const watchlistStore = useWatchlistStore()
const { searchStocks } = useStockApi()

const mockResults = [
  { sym: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { sym: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { sym: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { sym: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { sym: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { sym: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Cyclical' },
  { sym: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { sym: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial' },
  { sym: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial' },
  { sym: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Defensive' },
]

const filteredResults = computed(() => {
  if (!query.value) return mockResults
  const q = query.value.toLowerCase()
  return mockResults.filter(r =>
    r.sym.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
  )
})

const columns = [
  { key: 'sym', label: 'Symbol' },
  { key: 'name', label: 'Company' },
  { key: 'exchange', label: 'Exchange' },
  { key: 'sector', label: 'Sector' },
  { key: 'action', label: '' },
]

function isAdded(sym: string) {
  return !!watchlistStore.watchlist.find(s => s.sym === sym)
}

function addStock(row: typeof mockResults[0]) {
  watchlistStore.addStock({
    sym: row.sym,
    name: row.name,
    price: +(Math.random() * 400 + 50).toFixed(2),
    change: +(Math.random() * 10 - 5).toFixed(2),
    changePct: +(Math.random() * 4 - 2).toFixed(2),
  })
}
</script>
