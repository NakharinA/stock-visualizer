export interface IndicatorDef {
  type: string
  label: string
  pane: 'main' | 'sub'
  color: string
  defaultParams: Record<string, number>
}

export const INDICATOR_DEFS: IndicatorDef[] = [
  { type: 'SMA', label: 'SMA', pane: 'main', color: '#f48fb1', defaultParams: { length: 14 } },
  { type: 'EMA', label: 'EMA', pane: 'main', color: '#80cbc4', defaultParams: { length: 14 } },
  { type: 'BB', label: 'Bollinger Bands', pane: 'main', color: '#ce93d8', defaultParams: { length: 20, std: 2 } },
  { type: 'RSI', label: 'RSI', pane: 'sub', color: '#4fc3f7', defaultParams: { length: 14 } },
  { type: 'MACD', label: 'MACD', pane: 'sub', color: '#ffb74d', defaultParams: { fast: 12, slow: 26, signal: 9 } },
  { type: 'STOCHRSI', label: 'Stoch RSI', pane: 'sub', color: '#aed581', defaultParams: { length: 14, rsi_length: 14, k: 3, d: 3 } },
  { type: 'ZSCORE', label: 'Z-Score', pane: 'sub', color: '#ff8a65', defaultParams: { length: 20 } },
]
