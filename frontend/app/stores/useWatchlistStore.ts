import { defineStore } from 'pinia'

export interface WatchlistItem {
  sym: string
  name: string
  price: number
  change: number
  changePct: number
}

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlist = ref<WatchlistItem[]>([
    { sym: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.15, changePct: 1.14 },
    { sym: 'TSLA', name: 'Tesla Inc.', price: 242.10, change: -4.30, changePct: -1.75 },
    { sym: 'NVDA', name: 'NVIDIA Corporation', price: 875.40, change: 12.60, changePct: 1.46 },
  ])
  const focusedSym = ref<string>('AAPL')

  const focusedStock = computed(() =>
    watchlist.value.find(s => s.sym === focusedSym.value) ?? null,
  )

  function addStock(item: WatchlistItem) {
    if (!watchlist.value.find(s => s.sym === item.sym)) {
      watchlist.value.push(item)
    }
  }

  function removeStock(sym: string) {
    watchlist.value = watchlist.value.filter(s => s.sym !== sym)
    if (focusedSym.value === sym) {
      focusedSym.value = watchlist.value[0]?.sym ?? ''
    }
  }

  function setFocused(sym: string) {
    focusedSym.value = sym
  }

  return { watchlist, focusedSym, focusedStock, addStock, removeStock, setFocused }
})
