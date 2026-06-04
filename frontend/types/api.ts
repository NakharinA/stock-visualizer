export interface OHLCVBar {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface EMAPoint {
  time: string
  value: number
}

export interface MACDData {
  macd: EMAPoint[]
  signal: EMAPoint[]
  histogram: EMAPoint[]
}

export interface StochRSIData {
  k: EMAPoint[]
  d: EMAPoint[]
}

export interface FibonacciData {
  high: number
  low: number
  levels: Record<string, number>
}

export interface FVGBox {
  type: 'bullish' | 'bearish'
  top: number
  bottom: number
  time: string
}

export interface IndicatorsData {
  ema20: EMAPoint[]
  ema50: EMAPoint[]
  ema100: EMAPoint[]
  ema200: EMAPoint[]
  macd: MACDData
  rsi: EMAPoint[]
  stoch_rsi: StochRSIData
  fibonacci: FibonacciData
  support_resistance: number[]
  fvg: FVGBox[]
}

export interface StockResponse {
  symbol: string
  period: string
  ohlcv: OHLCVBar[]
  indicators: IndicatorsData
}

export interface OverviewItem {
  symbol: string
  price: number
  diff_value: number
  diff_pct: number
}

export interface SearchResult {
  symbol: string
  name: string
}
