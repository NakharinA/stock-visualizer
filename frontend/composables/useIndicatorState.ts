export interface IndicatorState {
  ema20: boolean
  ema50: boolean
  ema100: boolean
  ema200: boolean
  macd: boolean
  rsi: boolean
  stochRsi: boolean
  fibonacci: boolean
  supportResistance: boolean
  fvg: boolean
}

export function useIndicatorState() {
  const indicators = ref<IndicatorState>({
    ema20: false,
    ema50: false,
    ema100: false,
    ema200: false,
    macd: false,
    rsi: false,
    stochRsi: false,
    fibonacci: false,
    supportResistance: false,
    fvg: false,
  })
  return { indicators }
}
