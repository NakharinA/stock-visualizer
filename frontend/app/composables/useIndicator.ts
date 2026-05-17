import type { Candle, IndicatorResponse } from '~/types'

export const useIndicator = () => {
  const { $config } = useNuxtApp()
  const base = $config.public.apiBase

  const buildOHLCVPayload = (candles: Candle[]) => ({
    time: candles.map((c) => c.time),
    open: candles.map((c) => c.open),
    high: candles.map((c) => c.high),
    low: candles.map((c) => c.low),
    close: candles.map((c) => c.close),
    volume: candles.map((c) => c.volume),
  })

  const compute = async (
    type: string,
    candles: Candle[],
    params: Record<string, unknown> = {},
  ): Promise<IndicatorResponse> => {
    return await $fetch<IndicatorResponse>(`${base}/indicator/compute`, {
      method: 'POST',
      body: { type, params, data: buildOHLCVPayload(candles) },
    })
  }

  return { compute }
}
