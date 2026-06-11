<script setup lang="ts">
import type { OverviewItem } from '~/types/api'
import { MOVERS_UNIVERSE } from '~/utils/symbols'

const { symbols, addSymbol, removeSymbol } = useWatchlist()
const { fetchOverview } = useStockApi()

const tableData = ref<OverviewItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const newSymbol = ref('')
const formErr = ref('')

async function loadData() {
  if (symbols.value.length === 0) {
    tableData.value = []
    return
  }
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

// Reload whenever the watchlist changes (covers initial localStorage hydration too).
watch(symbols, loadData, { immediate: true, deep: true })

const quickAdd = computed(() =>
  MOVERS_UNIVERSE.filter(s => !symbols.value.includes(s)).slice(0, 7),
)

function addAndLoad(symbol: string) {
  const added = addSymbol(symbol)
  if (added) {
    newSymbol.value = ''
    formErr.value = ''
    loadData()
  } else {
    formErr.value = 'Already in watchlist'
  }
}

function handleAdd() {
  const s = newSymbol.value.trim().toUpperCase()
  if (!s) return
  if (!/^[A-Z.]{1,6}$/.test(s)) {
    formErr.value = 'Enter a valid ticker'
    return
  }
  addAndLoad(s)
}

function handleRemove(symbol: string) {
  removeSymbol(symbol)
  tableData.value = tableData.value.filter(item => item.symbol !== symbol)
}
</script>

<template>
  <div class="page overview">
    <div class="ov-head">
      <div>
        <h1 class="h1">Overview</h1>
        <p class="sub">{{ symbols.length }} symbols · saved to this browser</p>
      </div>
      <form class="add-form" @submit.prevent="handleAdd">
        <div class="add-wrap">
          <UiAppIcon name="plus" :size="16" />
          <input
            v-model="newSymbol"
            class="add-input"
            placeholder="Add symbol (e.g. NFLX)"
            maxlength="6"
            @input="newSymbol = newSymbol.toUpperCase(); formErr = ''"
          >
        </div>
        <button class="btn-accent" type="submit">Add</button>
      </form>
    </div>

    <div v-if="formErr" class="form-err">{{ formErr }}</div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      class="mb-4"
      :actions="[{ label: 'Try again', color: 'error', variant: 'outline', onClick: loadData }]"
    />

    <div class="sugg">
      <span class="sugg-l">Quick add</span>
      <button
        v-for="s in quickAdd"
        :key="s"
        class="chip"
        @click="addAndLoad(s)"
      >
        + {{ s }}
      </button>
      <span v-if="quickAdd.length === 0" class="sugg-l">all added</span>
    </div>

    <OverviewStockTable
      :data="tableData"
      :loading="loading"
      @remove="handleRemove"
      @row-click="(s) => navigateTo(`/stock/${s}`)"
    />
  </div>
</template>
