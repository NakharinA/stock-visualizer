import type { StockResponse, SearchResult, Interval, Period } from '~/types'

export const useStockData = () => {
  const { $config } = useNuxtApp()
  const base = $config.public.apiBase

  const fetchOHLCV = async (
    ticker: string,
    interval: Interval = '1d',
    period: Period = '6mo',
  ): Promise<StockResponse> => {
    return await $fetch<StockResponse>(`${base}/stock/${ticker}`, {
      params: { interval, period },
    })
  }

  const searchTickers = async (query: string): Promise<SearchResult[]> => {
    const data = await $fetch<{ results: SearchResult[] }>(`${base}/stock/search/query`, {
      params: { q: query },
    })
    return data.results
  }

  return { fetchOHLCV, searchTickers }
}
