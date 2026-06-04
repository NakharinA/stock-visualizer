const STORAGE_KEY = 'stock-watchlist'
const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY']

export function useWatchlist() {
  const symbols = ref<string[]>([])

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      symbols.value = [...DEFAULT_SYMBOLS]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols.value))
    } else {
      try {
        symbols.value = JSON.parse(stored)
      } catch {
        symbols.value = [...DEFAULT_SYMBOLS]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols.value))
      }
    }
  })

  watch(
    symbols,
    (val) => {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      }
    },
    { deep: true },
  )

  function addSymbol(symbol: string): boolean {
    const upper = symbol.trim().toUpperCase()
    if (!upper || symbols.value.includes(upper)) return false
    symbols.value = [...symbols.value, upper]
    return true
  }

  function removeSymbol(symbol: string): void {
    symbols.value = symbols.value.filter((s) => s !== symbol)
  }

  return { symbols, addSymbol, removeSymbol }
}
