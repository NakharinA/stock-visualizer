<template>
  <UModal v-model:open="open" title="Add Stock" :ui="{ content: 'bg-elevated border border-default' }">
    <template #body>
      <div class="space-y-4">
        <UInput
          v-model="query"
          class="w-full"
          placeholder="Search by symbol or company name…"
          icon="i-lucide-search"
          autofocus
          @input="onSearch"
        />

        <!-- Error -->
        <UAlert
          v-if="addError"
          color="error"
          variant="subtle"
          :description="addError"
          icon="i-lucide-alert-circle"
        />

        <div class="overflow-auto max-h-72">
          <div v-if="searching" class="flex items-center justify-center py-8 text-muted text-sm gap-2">
            <UIcon name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            Searching…
          </div>
          <UTable
            v-else
            :data="results"
            :columns="columns"
          >
            <template #action-cell="{ row }">
              <UButton
                size="xs"
                class="w-full"
                :disabled="isAdded(row.original.sym) || addingSyms.has(row.original.sym)"
                :loading="addingSyms.has(row.original.sym)"
                :color="isAdded(row.original.sym) ? 'neutral' : 'primary'"
                :variant="isAdded(row.original.sym) ? 'subtle' : 'solid'"
                @click="addStock(row.original.sym)"
              >
                {{ isAdded(row.original.sym) ? 'Added' : 'Add' }}
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
const searching = ref(false)
const addingSyms = ref<Set<string>>(new Set())
const addError = ref<string | null>(null)

const watchlistStore = useWatchlistStore()
const stockApi = useStockApi()

interface SearchResult {
  sym: string
  name: string
  exchange: string
  sector: string
}

const results = ref<SearchResult[]>([])

// Debounce search
let searchTimer: ReturnType<typeof setTimeout> | null = null
async function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      results.value = await stockApi.searchStocks(query.value)
    }
    catch {
      results.value = []
    }
    finally {
      searching.value = false
    }
  }, 300)
}

// Initial load
onMounted(async () => {
  searching.value = true
  try {
    results.value = await stockApi.searchStocks('')
  }
  catch {
    results.value = []
  }
  finally {
    searching.value = false
  }
})

const columns = [
  { accessorKey: 'sym', header: 'Symbol' },
  { accessorKey: 'name', header: 'Company' },
  { accessorKey: 'exchange', header: 'Exchange' },
  { accessorKey: 'sector', header: 'Sector' },
  { id: 'action', header: '' },
]

function isAdded(sym: string) {
  return !!watchlistStore.watchlist.find(s => s.sym === sym)
}

async function addStock(sym: string) {
  addError.value = null
  addingSyms.value = new Set([...addingSyms.value, sym])
  try {
    await watchlistStore.addStock(sym)
  }
  catch (err: any) {
    const status = err?.response?.status
    if (status === 409) {
      addError.value = `${sym} is already in your watchlist.`
    }
    else if (status === 404) {
      addError.value = `Symbol ${sym} not found.`
    }
    else {
      addError.value = 'Failed to add stock. Please try again.'
    }
  }
  finally {
    addingSyms.value = new Set([...addingSyms.value].filter(s => s !== sym))
  }
}
</script>
