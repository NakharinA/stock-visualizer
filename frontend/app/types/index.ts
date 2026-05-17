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

export interface IndicatorSeries {
  name: string
  time: number[]
  values: (number | null)[]
}

export interface IndicatorResponse {
  type: string
  series: IndicatorSeries[]
}

export interface ActiveIndicator {
  id: string
  type: string
  params: Record<string, unknown>
  formula?: string
  pane: 'main' | 'sub'
  color: string
  series: IndicatorSeries[]
}

export type DrawingToolType = 'none' | 'trendline' | 'hline' | 'fvgbox' | 'freehand'

export interface DrawingPoint {
  time: number
  price: number
}

export interface Drawing {
  id: string
  tool: DrawingToolType
  points: DrawingPoint[]
  color: string
  opacity: number
  lineWidth: number
}
