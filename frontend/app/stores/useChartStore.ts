import { defineStore } from 'pinia'

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y'

export interface CandleBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const useChartStore = defineStore('chart', () => {
  const timeframe = ref<Timeframe>('1Y')
  const candleData = ref<CandleBar[]>([])
  const indicatorData = ref<Record<string, any>>({})
  const isLoading = ref(false)

  function setTimeframe(tf: Timeframe) {
    timeframe.value = tf
  }

  function setCandleData(data: CandleBar[]) {
    candleData.value = data
  }

  function setIndicatorData(data: Record<string, any>) {
    indicatorData.value = data
  }

  return { timeframe, candleData, indicatorData, isLoading, setTimeframe, setCandleData, setIndicatorData }
})
