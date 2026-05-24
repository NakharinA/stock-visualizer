import { defineStore } from 'pinia'

export interface WatchlistItem {
  sym: string
  name: string
  price: number
  change: number
  changePct: number
}

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlist = ref<WatchlistItem[]>([])
  const focusedSym = ref<string>('')
  const isLoading = ref(false)

  const focusedStock = computed(() =>
    watchlist.value.find(s => s.sym === focusedSym.value) ?? null,
  )

  const { getWatchlist, addToWatchlist, removeFromWatchlist } = useStockApi()

  async function fetchWatchlist() {
    isLoading.value = true
    try {
      const items = await getWatchlist()
      watchlist.value = items
      // Set focused to first item if no focused sym yet
      if (!focusedSym.value && items.length > 0) {
        focusedSym.value = items[0]!.sym
      }
    }
    catch (err) {
      console.error('[watchlist] fetch failed', err)
    }
    finally {
      isLoading.value = false
    }
  }

  async function addStock(sym: string) {
    try {
      const item = await addToWatchlist(sym)
      if (!watchlist.value.find(s => s.sym === item.sym)) {
        watchlist.value.push(item)
      }
      return item
    }
    catch (err: any) {
      // Re-throw so callers (modal) can handle 409 etc.
      throw err
    }
  }

  async function removeStock(sym: string) {
    await removeFromWatchlist(sym)
    watchlist.value = watchlist.value.filter(s => s.sym !== sym)
    if (focusedSym.value === sym) {
      focusedSym.value = watchlist.value[0]?.sym ?? ''
    }
  }

  function setFocused(sym: string) {
    focusedSym.value = sym
  }

  return {
    watchlist,
    focusedSym,
    focusedStock,
    isLoading,
    fetchWatchlist,
    addStock,
    removeStock,
    setFocused,
  }
})
