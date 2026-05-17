import type { WatchlistItem } from '~/types'

export const useWatchlist = () => {
  const { $config } = useNuxtApp()
  const base = $config.public.apiBase

  const fetchWatchlist = async (): Promise<WatchlistItem[]> => {
    const data = await $fetch<{ items: WatchlistItem[] }>(`${base}/watchlist`)
    return data.items
  }

  const addToWatchlist = async (ticker: string, name?: string): Promise<WatchlistItem> => {
    return await $fetch<WatchlistItem>(`${base}/watchlist`, {
      method: 'POST',
      body: { ticker, name },
    })
  }

  const removeFromWatchlist = async (ticker: string): Promise<void> => {
    await $fetch(`${base}/watchlist/${ticker}`, { method: 'DELETE' })
  }

  return { fetchWatchlist, addToWatchlist, removeFromWatchlist }
}
