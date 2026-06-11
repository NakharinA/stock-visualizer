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

const STORAGE_KEY = 'sv.tog'

// Design handoff defaults: a few overlays + MACD on for an informative first view.
function defaults(): IndicatorState {
  return {
    ema20: true,
    ema50: true,
    ema100: false,
    ema200: false,
    macd: true,
    rsi: false,
    stochRsi: false,
    fibonacci: false,
    supportResistance: true,
    fvg: true,
  }
}

export function useIndicatorState() {
  const indicators = ref<IndicatorState>(defaults())

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        // Merge so newly added keys keep their default if absent from storage.
        indicators.value = { ...defaults(), ...JSON.parse(stored) }
      } catch {
        indicators.value = defaults()
      }
    }
  })

  watch(
    indicators,
    (val) => {
      if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  return { indicators }
}
