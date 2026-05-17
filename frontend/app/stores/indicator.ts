import { defineStore } from 'pinia'
import type { ActiveIndicator, IndicatorResponse } from '~/types'

export const useIndicatorStore = defineStore('indicator', () => {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase

  const indicators = ref<ActiveIndicator[]>([])

  async function addIndicator(
    def: Omit<ActiveIndicator, 'id' | 'series'>,
  ) {
    const chartStore = useChartStore()
    const candles = chartStore.candles
    const data = {
      time: candles.map(c => c.time),
      open: candles.map(c => c.open),
      high: candles.map(c => c.high),
      low: candles.map(c => c.low),
      close: candles.map(c => c.close),
      volume: candles.map(c => c.volume),
    }

    const res = await $fetch<IndicatorResponse>(`${apiBase}/indicator/compute`, {
      method: 'POST',
      body: {
        type: def.type,
        params: def.params ?? {},
        formula: def.formula,
        data,
      },
    })

    indicators.value.push({
      ...def,
      id: crypto.randomUUID(),
      series: res.series,
    })
  }

  function removeIndicator(id: string) {
    indicators.value = indicators.value.filter(i => i.id !== id)
  }

  return { indicators, addIndicator, removeIndicator }
})
