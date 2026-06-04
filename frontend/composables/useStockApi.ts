import type { StockResponse, OverviewItem, SearchResult } from '~/types/api'

export function useStockApi() {
  async function fetchStock(_symbol: string, _period: string): Promise<StockResponse> {
    // TODO: implement in Phase 04
    throw new Error('Not implemented')
  }

  async function fetchOverview(_symbols: string[]): Promise<OverviewItem[]> {
    // TODO: implement in Phase 04
    throw new Error('Not implemented')
  }

  async function searchSymbols(_query: string): Promise<SearchResult[]> {
    // TODO: implement in Phase 04
    throw new Error('Not implemented')
  }

  return { fetchStock, fetchOverview, searchSymbols }
}
