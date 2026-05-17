export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockResponse {
  ticker: string
  interval: string
  period: string
  candles: Candle[]
}

export interface SearchResult {
  symbol: string
  name: string
  exchange: string
}

export interface WatchlistItem {
  ticker: string
  name: string | null
  added_at: string
  price: number | null
  change: number | null
  change_pct: number | null
}

export interface IndicatorSeries {
  name: string
  time: number[]
  values: (number | null)[]
}

export interface IndicatorResponse {
  type: string
  series: IndicatorSeries[]
}

export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo'
export type Period = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y'

export type IndicatorType = 'RSI' | 'STOCHRSI' | 'MACD' | 'ZSCORE' | 'VOLUME'
export type EmaLength = 20 | 50 | 100 | 200
