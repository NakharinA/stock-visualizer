import { defineStore } from 'pinia'

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y'

export interface CandleBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export const useChartStore = defineStore('chart', () => {
  const timeframe = ref<Timeframe>('1D')
  const candleData = ref<CandleBar[]>([])
  const isLoading = ref(false)

  function setTimeframe(tf: Timeframe) {
    timeframe.value = tf
  }

  function setCandleData(data: CandleBar[]) {
    candleData.value = data
  }

  return { timeframe, candleData, isLoading, setTimeframe, setCandleData }
})
