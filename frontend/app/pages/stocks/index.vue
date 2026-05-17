<script setup lang="ts">
import type { WatchlistItem } from '~/types'

const { fetchWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist()
const toast = useToast()

const items = ref<WatchlistItem[]>([])
const loading = ref(true)
const showAddDialog = ref(false)
const addingTicker = ref('')

const load = async () => {
  loading.value = true
  try {
    items.value = await fetchWatchlist()
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load watchlist', life: 3000 })
  } finally {
    loading.value = false
  }
}

onMounted(load)

const onAdded = async (ticker: string, name: string) => {
  addingTicker.value = ticker
  try {
    const item = await addToWatchlist(ticker, name)
    items.value.unshift(item)
    toast.add({ severity: 'success', summary: 'Added', detail: `${ticker} added to watchlist`, life: 2500 })
  } catch (err: unknown) {
    const msg = (err as { data?: { detail?: string } })?.data?.detail ?? 'Failed to add stock'
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 3000 })
  } finally {
    addingTicker.value = ''
  }
}

const onRemove = async (ticker: string) => {
  try {
    await removeFromWatchlist(ticker)
    items.value = items.value.filter((i) => i.ticker !== ticker)
    toast.add({ severity: 'info', summary: 'Removed', detail: `${ticker} removed`, life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove stock', life: 3000 })
  }
}

const formatChange = (v: number | null) => (v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2))
const formatPct = (v: number | null) => (v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%')
const changeClass = (v: number | null) => (v == null ? '' : v >= 0 ? 'positive' : 'negative')
</script>

<template>
  <div>
    <div class="page-header" style="display: flex; align-items: center; justify-content: space-between">
      <div>
        <h1 class="page-title">Stock Watchlist</h1>
        <p class="page-subtitle">Add stocks you want to track.</p>
      </div>
      <Button icon="pi pi-plus" label="Add Stock" @click="showAddDialog = true" />
    </div>

    <Card>
      <template #content>
        <DataTable
          :value="items"
          :loading="loading"
          paginator
          :rows="15"
          :rowsPerPageOptions="[10, 15, 25, 50]"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          emptyMessage="No stocks in your watchlist yet. Add one to get started."
          stripedRows
        >
          <Column field="ticker" header="Ticker" sortable style="width: 120px">
            <template #body="{ data }">
              <NuxtLink :to="`/stocks/${data.ticker}`" style="font-weight: 700; text-decoration: none; color: var(--p-primary-color)">
                {{ data.ticker }}
              </NuxtLink>
            </template>
          </Column>

          <Column field="name" header="Name" sortable>
            <template #body="{ data }">
              <span style="color: var(--p-text-muted-color)">{{ data.name ?? '—' }}</span>
            </template>
          </Column>

          <Column field="price" header="Price" sortable style="width: 110px">
            <template #body="{ data }">
              {{ data.price != null ? '$' + data.price.toFixed(2) : '—' }}
            </template>
          </Column>

          <Column field="change" header="Change" sortable style="width: 110px">
            <template #body="{ data }">
              <span :class="changeClass(data.change)">{{ formatChange(data.change) }}</span>
            </template>
          </Column>

          <Column field="change_pct" header="Change %" sortable style="width: 110px">
            <template #body="{ data }">
              <span :class="changeClass(data.change_pct)">{{ formatPct(data.change_pct) }}</span>
            </template>
          </Column>

          <Column field="added_at" header="Added" sortable style="width: 160px">
            <template #body="{ data }">
              <span style="font-size: 0.8rem; color: var(--p-text-muted-color)">
                {{ new Date(data.added_at).toLocaleDateString() }}
              </span>
            </template>
          </Column>

          <Column header="" style="width: 60px">
            <template #body="{ data }">
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                size="small"
                v-tooltip.top="'Remove'"
                @click="onRemove(data.ticker)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <StockAddStockDialog v-model:visible="showAddDialog" @added="onAdded" />
  </div>
</template>
