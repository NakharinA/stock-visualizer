import type { StockResponse, OverviewItem, SearchResult } from '~/types/api'

export function useStockApi() {
  async function fetchStock(symbol: string, period: string): Promise<StockResponse> {
    return $fetch<StockResponse>(`/api/stock/${symbol}`, {
      query: { period },
    })
  }

  async function fetchOverview(symbols: string[]): Promise<OverviewItem[]> {
    return $fetch<OverviewItem[]>('/api/overview', {
      query: { symbols: symbols.join(',') },
    })
  }

  async function searchSymbols(query: string): Promise<SearchResult[]> {
    return $fetch<SearchResult[]>('/api/search', {
      query: { q: query, limit: 8 },
    })
  }

  return { fetchStock, fetchOverview, searchSymbols }
}
