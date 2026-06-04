<script setup lang="ts">
import type { OverviewItem } from '~/types/api'

const { symbols, addSymbol, removeSymbol } = useWatchlist()
const { fetchOverview } = useStockApi()

const tableData = ref<OverviewItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const newSymbol = ref('')
const duplicateWarning = ref(false)
let warningTimer: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  if (symbols.value.length === 0) return
  loading.value = true
  error.value = null
  try {
    tableData.value = await fetchOverview(symbols.value)
  } catch {
    error.value = 'Failed to load stock data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Initial load after useWatchlist populates from localStorage
onMounted(() => {
  loadData()
})

function handleAdd() {
  const upper = newSymbol.value.trim().toUpperCase()
  if (!upper) return

  const added = addSymbol(upper)
  if (added) {
    newSymbol.value = ''
    duplicateWarning.value = false
    loadData()
  } else {
    duplicateWarning.value = true
    if (warningTimer) clearTimeout(warningTimer)
    warningTimer = setTimeout(() => {
      duplicateWarning.value = false
    }, 3000)
  }
}

function handleRemove(symbol: string) {
  removeSymbol(symbol)
  tableData.value = tableData.value.filter((item) => item.symbol !== symbol)
}

function handleRowClick(symbol: string) {
  navigateTo(`/stock/${symbol}`)
}
</script>

<template>
  <div class="p-6 flex flex-col gap-6">
    <h1 class="text-2xl font-semibold text-white">Overview</h1>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
    />

    <OverviewStockTable
      :data="tableData"
      :loading="loading"
      @remove="handleRemove"
      @row-click="handleRowClick"
    />

    <div class="flex flex-col gap-2">
      <div class="flex gap-2 max-w-sm">
        <UInput
          v-model="newSymbol"
          placeholder="Add symbol (e.g. NFLX)"
          class="flex-1"
          @keydown.enter="handleAdd"
        />
        <UButton label="Add" @click="handleAdd" />
      </div>

      <UAlert
        v-if="duplicateWarning"
        color="warning"
        variant="soft"
        description="Already in watchlist"
        icon="i-heroicons-information-circle"
        class="max-w-sm"
      />
    </div>
  </div>
</template>
