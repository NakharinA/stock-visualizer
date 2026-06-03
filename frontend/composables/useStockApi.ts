export function useStockApi() {
  async function getStock(_symbol: string, _period: string) {
    return null
  }

  async function getOverview(_symbols: string[]) {
    return []
  }

  async function searchSymbols(_query: string) {
    return []
  }

  return { getStock, getOverview, searchSymbols }
}
