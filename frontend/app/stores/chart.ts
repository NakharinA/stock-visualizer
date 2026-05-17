import { defineStore } from 'pinia'
import type { Candle, StockResponse } from '~/types'

export const useChartStore = defineStore('chart', () => {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase

  const ticker = ref('AAPL')
  const interval = ref('1d')
  const period = ref('6mo')
  const candles = ref<Candle[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCandles() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<StockResponse>(`${apiBase}/stock/${ticker.value}`, {
        params: { interval: interval.value, period: period.value },
      })
      candles.value = data.candles
    } catch (e: unknown) {
      const err = e as { data?: { detail?: string }; message?: string }
      error.value = err?.data?.detail || err?.message || 'Failed to fetch data'
    } finally {
      loading.value = false
    }
  }

  function setTicker(t: string) {
    ticker.value = t.toUpperCase()
    fetchCandles()
  }

  function setInterval(i: string) {
    interval.value = i
    fetchCandles()
  }

  function setPeriod(p: string) {
    period.value = p
    fetchCandles()
  }

  return { ticker, interval, period, candles, loading, error, fetchCandles, setTicker, setInterval, setPeriod }
})
