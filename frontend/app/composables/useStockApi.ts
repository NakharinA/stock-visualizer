import type { CandleBar, Timeframe } from '~/stores/useChartStore'
import type { WatchlistItem } from '~/stores/useWatchlistStore'

// ── Response types matching backend schemas ──────────────────────────────────

interface CandlesResponse {
  sym: string
  timeframe: string
  bars: CandleBar[]
}

interface SearchResult {
  sym: string
  name: string
  exchange: string
  sector: string
}

interface SearchResponse {
  results: SearchResult[]
}

interface WatchlistResponse {
  items: WatchlistItem[]
}

interface PnlPoint {
  date: string
  pnl: number
}

interface PnlResponse {
  data: PnlPoint[]
  totalPnl: number
  totalPnlPct: number
}

interface StatsResponse {
  focusedSym: string | null
  focusedPrice: number | null
  todayPnl: number
  todayPnlPct: number
  totalValue: number
  totalCost: number
}

interface IndicatorsResponse {
  sym: string
  timeframe: string
  indicators: Record<string, any>
}

// ── Composable ───────────────────────────────────────────────────────────────

export function useStockApi() {
  const { apiFetch } = useApiFetch()

  async function getCandles(sym: string, tf: Timeframe): Promise<CandleBar[]> {
    const res = await apiFetch<CandlesResponse>(`/stocks/${sym}/candles`, {
      params: { timeframe: tf },
    })
    return res.bars
  }

  async function searchStocks(query: string, limit = 20): Promise<SearchResult[]> {
    const res = await apiFetch<SearchResponse>('/stocks/search', {
      params: { query, limit },
    })
    return res.results
  }

  async function getWatchlist(): Promise<WatchlistItem[]> {
    const res = await apiFetch<WatchlistResponse>('/watchlist')
    return res.items
  }

  async function addToWatchlist(sym: string): Promise<WatchlistItem> {
    return apiFetch<WatchlistItem>('/watchlist', {
      method: 'POST',
      body: { sym },
    })
  }

  async function removeFromWatchlist(sym: string): Promise<void> {
    await apiFetch(`/watchlist/${sym}`, { method: 'DELETE' })
  }

  async function getIndicators(
    sym: string,
    tf: Timeframe,
    indicators: string[],
  ): Promise<IndicatorsResponse> {
    return apiFetch<IndicatorsResponse>(`/stocks/${sym}/indicators`, {
      params: { timeframe: tf, indicators: indicators.join(',') },
    })
  }

  async function getPortfolioPnl(period = '7d'): Promise<PnlResponse> {
    return apiFetch<PnlResponse>('/portfolio/pnl', { params: { period } })
  }

  async function getPortfolioStats(): Promise<StatsResponse> {
    return apiFetch<StatsResponse>('/portfolio/stats')
  }

  return {
    getCandles,
    searchStocks,
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    getIndicators,
    getPortfolioPnl,
    getPortfolioStats,
  }
}
