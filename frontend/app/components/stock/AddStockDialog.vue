<script setup lang="ts">
import type { SearchResult } from '~/types'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  added: [ticker: string, name: string]
}>()

const { searchTickers } = useStockData()
const query = ref('')
const results = ref<SearchResult[]>([])
const selected = ref<SearchResult | null>(null)
const searching = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>

const onSearch = (event: { query: string }) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    if (!event.query.trim()) {
      results.value = []
      return
    }
    searching.value = true
    try {
      results.value = await searchTickers(event.query)
    } finally {
      searching.value = false
    }
  }, 300)
}

const onSelect = (event: { value: SearchResult }) => {
  selected.value = event.value
}

const onAdd = () => {
  if (!selected.value) return
  emit('added', selected.value.symbol, selected.value.name)
  reset()
}

const reset = () => {
  query.value = ''
  results.value = []
  selected.value = null
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    header="Add Stock to Watchlist"
    :modal="true"
    :closable="true"
    style="width: 420px"
    @hide="reset"
  >
    <div style="padding: 0.5rem 0">
      <label class="block mb-1" style="font-size: 0.875rem; font-weight: 500">Search Ticker</label>
      <AutoComplete
        v-model="query"
        :suggestions="results"
        optionLabel="symbol"
        placeholder="e.g. AAPL, TSLA"
        :loading="searching"
        forceSelection
        style="width: 100%"
        @complete="onSearch"
        @item-select="onSelect"
      >
        <template #option="{ option }">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem">
            <span style="font-weight: 600">{{ option.symbol }}</span>
            <span style="font-size: 0.8rem; color: var(--p-text-muted-color)">{{ option.name }}</span>
            <Tag :value="option.exchange" severity="secondary" style="font-size: 0.7rem; margin-left: auto" />
          </div>
        </template>
      </AutoComplete>

      <p v-if="selected" style="margin-top: 0.75rem; font-size: 0.875rem; color: var(--p-text-muted-color)">
        Selected: <strong>{{ selected.symbol }}</strong> — {{ selected.name }}
      </p>
    </div>

    <template #footer>
      <Button label="Cancel" severity="secondary" text @click="reset" />
      <Button label="Add" icon="pi pi-plus" :disabled="!selected" @click="onAdd" />
    </template>
  </Dialog>
</template>
