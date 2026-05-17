<script setup lang="ts">
import type { SearchResult } from '~/types'

const runtimeConfig = useRuntimeConfig()
const apiBase = runtimeConfig.public.apiBase

const chartStore = useChartStore()
const query = ref(chartStore.ticker)
const results = ref<SearchResult[]>([])

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function search(event: { query: string }) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!event.query.trim()) {
      results.value = []
      return
    }
    try {
      const data = await $fetch<{ results: SearchResult[] }>(
        `${apiBase}/stock/search/query`,
        { params: { q: event.query } },
      )
      results.value = data.results
    } catch {
      results.value = []
    }
  }, 300)
}

function onSelect(event: { value: SearchResult }) {
  chartStore.setTicker(event.value.symbol)
}
</script>

<template>
  <AutoComplete
    v-model="query"
    :suggestions="results"
    option-label="symbol"
    :dropdown="false"
    placeholder="Search ticker…"
    @complete="search"
    @item-select="onSelect"
  >
    <template #option="{ option }">
      <div class="ticker-option">
        <span class="ticker-symbol">{{ option.symbol }}</span>
        <span class="ticker-name">{{ option.name }}</span>
      </div>
    </template>
  </AutoComplete>
</template>

<style scoped>
.ticker-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.ticker-symbol {
  font-weight: bold;
  color: var(--color-text);
}
.ticker-name {
  color: var(--color-muted);
  font-size: 0.85rem;
}
</style>
