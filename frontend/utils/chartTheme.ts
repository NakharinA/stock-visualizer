// Shared Lightweight Charts theme, aligned to the "Ticker" design tokens so the
// main chart and the oscillator subpanel stay visually consistent with the page.
export const CHART_COLORS = {
  up: '#2ebd85',
  down: '#f6465d',
  accent: '#ff7a18',
  text2: '#9aa0ac',
  ema20: '#f5a623',
  ema50: '#4da6ff',
  ema100: '#c678dd',
  ema200: '#d7dae0',
} as const

// Base options shared by every chart instance (transparent bg → page color shows
// through, Plex Mono labels, locked horizontal pan, zoom enabled).
export const baseChartOptions = {
  layout: {
    background: { color: 'transparent' },
    textColor: CHART_COLORS.text2,
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
  },
  grid: {
    vertLines: { color: 'rgba(255,255,255,0.035)' },
    horzLines: { color: 'rgba(255,255,255,0.045)' },
  },
  rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
  timeScale: {
    borderColor: 'rgba(255,255,255,0.08)',
    fixLeftEdge: true,
    fixRightEdge: true,
    rightOffset: 2,
    minBarSpacing: 2,
  },
  handleScroll: { mouseWheel: false, pressedMouseMove: false, horzTouchDrag: false, vertTouchDrag: false },
  handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
}

// Kept for backward compatibility with components importing CHART_THEME.
export const CHART_THEME = {
  layout: baseChartOptions.layout,
  grid: baseChartOptions.grid,
}
