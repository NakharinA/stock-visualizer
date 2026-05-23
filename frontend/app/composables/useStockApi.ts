import type { CandleBar, Timeframe } from '~/stores/useChartStore'
import type { WatchlistItem } from '~/stores/useWatchlistStore'

function generateCandles(sym: string, tf: Timeframe): CandleBar[] {
  const counts: Record<Timeframe, number> = { '1D': 390, '1W': 5 * 78, '1M': 22 * 30, '3M': 66 * 30, '1Y': 252 * 6 }
  const n = counts[tf]
  const prices: Record<string, number> = {
    AAPL: 189, TSLA: 242, NVDA: 875, GOOGL: 175, MSFT: 420,
    AMZN: 195, META: 510, JPM: 210, V: 280, WMT: 68,
  }
  let price = prices[sym] ?? 100
  const now = Math.floor(Date.now() / 1000)
  const intervalSecs: Record<Timeframe, number> = { '1D': 60, '1W': 5 * 60, '1M': 30 * 60, '3M': 60 * 60, '1Y': 4 * 60 * 60 }
  const step = intervalSecs[tf]
  const start = now - n * step

  return Array.from({ length: n }, (_, i) => {
    const o = price
    const c = +(o + (Math.random() - 0.49) * (price * 0.005)).toFixed(2)
    const h = +(Math.max(o, c) + Math.random() * price * 0.002).toFixed(2)
    const l = +(Math.min(o, c) - Math.random() * price * 0.002).toFixed(2)
    price = c
    return { time: start + i * step, open: o, high: h, low: l, close: c, volume: Math.floor(Math.random() * 1e6 + 1e5) }
  })
}

const SEARCH_DB = [
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

export function useStockApi() {
  async function getCandles(sym: string, tf: Timeframe): Promise<CandleBar[]> {
    await new Promise(r => setTimeout(r, 100))
    return generateCandles(sym, tf)
  }

  async function searchStocks(query: string) {
    await new Promise(r => setTimeout(r, 80))
    if (!query) return SEARCH_DB
    const q = query.toLowerCase()
    return SEARCH_DB.filter(s => s.sym.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
  }

  async function getWatchlist(): Promise<WatchlistItem[]> {
    return [
      { sym: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.15, changePct: 1.14 },
      { sym: 'TSLA', name: 'Tesla Inc.', price: 242.10, change: -4.30, changePct: -1.75 },
      { sym: 'NVDA', name: 'NVIDIA Corporation', price: 875.40, change: 12.60, changePct: 1.46 },
    ]
  }

  async function addToWatchlist(sym: string): Promise<void> {
    await new Promise(r => setTimeout(r, 50))
  }

  async function removeFromWatchlist(sym: string): Promise<void> {
    await new Promise(r => setTimeout(r, 50))
  }

  return { getCandles, searchStocks, getWatchlist, addToWatchlist, removeFromWatchlist }
}
