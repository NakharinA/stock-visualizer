import type { StockResponse, OverviewItem, SearchResult } from '~/types/api'

export function useStockApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  async function fetchStock(symbol: string, period: string): Promise<StockResponse> {
    return $fetch<StockResponse>(`${apiBase}/api/stock/${symbol}`, {
      query: { period },
    })
  }

  async function fetchOverview(symbols: string[]): Promise<OverviewItem[]> {
    return $fetch<OverviewItem[]>(`${apiBase}/api/overview`, {
      query: { symbols: symbols.join(',') },
    })
  }

  async function searchSymbols(query: string): Promise<SearchResult[]> {
    return $fetch<SearchResult[]>(`${apiBase}/api/search`, {
      query: { q: query, limit: 8 },
    })
  }

  return { fetchStock, fetchOverview, searchSymbols }
}
