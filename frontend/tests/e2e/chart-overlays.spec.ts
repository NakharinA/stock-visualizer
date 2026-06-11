import { test, expect, type Page } from '@playwright/test'

// Phase 10 redesign: overlays are toggled from the right rail (button.tog with
// aria-pressed). FVG now draws a canvas box; we assert the canvas stays
// functional rather than inspecting pixels. Defaults: ema20/ema50/SR/FVG/MACD on.

type Bar = { time: string, open: number, high: number, low: number, close: number, volume: number }
function makeBars(n = 30): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02'); d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}
function stockResponse(symbol = 'AAPL', period = '3mo') {
  const bars = makeBars(30)
  return {
    symbol, period, ohlcv: bars,
    indicators: {
      ema20: bars.map(b => ({ time: b.time, value: 182 })),
      ema50: bars.map(b => ({ time: b.time, value: 180 })),
      ema100: bars.map(b => ({ time: b.time, value: 178 })),
      ema200: bars.map(b => ({ time: b.time, value: 175 })),
      macd: { macd: [], signal: [], histogram: [] },
      rsi: [], stoch_rsi: { k: [], d: [] },
      fibonacci: { high: 200, low: 100, levels: { '0': 100, '0.5': 150, '1.0': 200 } },
      support_resistance: [160, 170, 180],
      fvg: [
        { type: 'bullish', top: 185, bottom: 182, time: bars[10].time },
        { type: 'bearish', top: 175, bottom: 172, time: bars[20].time },
      ],
    },
  }
}

async function mockApis(page: Page) {
  await page.addInitScript(() => localStorage.removeItem('sv.tog'))
  await page.route('**/api/stock/**', async (route) => {
    const url = new URL(route.request().url())
    const sym = url.pathname.split('/').pop() ?? 'AAPL'
    const period = url.searchParams.get('period') ?? '3mo'
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
  })
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.route('**/api/overview**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
}

async function gotoChart(page: Page) {
  await page.goto('/stock/AAPL')
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(400)
}

const tog = (page: Page, label: string) =>
  page.locator('button.tog').filter({ has: page.getByText(label, { exact: true }) })
const pressed = (page: Page, label: string) => expect(tog(page, label)).toHaveAttribute('aria-pressed', 'true')
const unpressed = (page: Page, label: string) => expect(tog(page, label)).toHaveAttribute('aria-pressed', 'false')

test.describe('Chart indicator overlays — E2E (redesigned rail)', () => {
  test('Fibonacci off by default; enabling/disabling keeps chart functional', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await unpressed(page, 'Fibonacci')
    await tog(page, 'Fibonacci').click()
    await pressed(page, 'Fibonacci')
    await expect(page.locator('canvas').first()).toBeVisible()
    await tog(page, 'Fibonacci').click()
    await unpressed(page, 'Fibonacci')
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('Support / Resistance on by default; can be turned off', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await pressed(page, 'Support / Resistance')
    await tog(page, 'Support / Resistance').click()
    await unpressed(page, 'Support / Resistance')
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('FVG on by default; toggling redraws and chart stays functional', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await pressed(page, 'Fair Value Gap')
    await tog(page, 'Fair Value Gap').click()
    await unpressed(page, 'Fair Value Gap')
    await tog(page, 'Fair Value Gap').click()
    await pressed(page, 'Fair Value Gap')
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('EMA 100 off→on→off, chart remains functional', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await unpressed(page, 'EMA 100')
    await tog(page, 'EMA 100').click()
    await pressed(page, 'EMA 100')
    await expect(page.locator('canvas').first()).toBeVisible()
    await tog(page, 'EMA 100').click()
    await unpressed(page, 'EMA 100')
  })

  test('toggling EMA 20 off does not affect EMA 50', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await pressed(page, 'EMA 20')
    await pressed(page, 'EMA 50')
    await tog(page, 'EMA 20').click()
    await unpressed(page, 'EMA 20')
    await pressed(page, 'EMA 50')
  })

  test('period switch preserves toggle state', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'Fibonacci').click()
    await pressed(page, 'Fibonacci')
    await page.getByRole('button', { name: '1Y' }).click()
    await page.waitForTimeout(1200)
    await pressed(page, 'Fibonacci')
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('independent toggles across overlays', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'Fibonacci').click() // on
    await tog(page, 'Support / Resistance').click() // off
    await tog(page, 'Fibonacci').click() // back off
    await unpressed(page, 'Fibonacci')
    await unpressed(page, 'Support / Resistance')
    await pressed(page, 'Fair Value Gap')
    await expect(page.locator('canvas').first()).toBeVisible()
  })
})
