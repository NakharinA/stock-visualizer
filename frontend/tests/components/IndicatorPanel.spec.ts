import { test, expect, type Page } from '@playwright/test'

// Phase 10 redesign: oscillator subpanel (.osc-wrap) shows a tab (button.osc-tab)
// only for ENABLED oscillators; active tab carries class "active"; the bar shows
// value readouts. Defaults: MACD on → subpanel open with MACD active.

type Bar = { time: string, open: number, high: number, low: number, close: number, volume: number }
function makeBars(n = 30): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02'); d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}
function stockBody() {
  const bars = makeBars(30)
  return JSON.stringify({
    symbol: 'AAPL', period: '3mo', ohlcv: bars,
    indicators: {
      ema20: [], ema50: [], ema100: [], ema200: [],
      macd: { macd: bars.map(b => ({ time: b.time, value: 0.5 })), signal: bars.map(b => ({ time: b.time, value: 0.3 })), histogram: bars.map(b => ({ time: b.time, value: 0.2 })) },
      rsi: bars.map(b => ({ time: b.time, value: 55 })),
      stoch_rsi: { k: bars.map(b => ({ time: b.time, value: 60 })), d: bars.map(b => ({ time: b.time, value: 55 })) },
      fibonacci: { high: 0, low: 0, levels: {} }, support_resistance: [], fvg: [],
    },
  })
}

async function setup(page: Page) {
  await page.addInitScript(() => localStorage.removeItem('sv.tog'))
  await page.route('**/api/stock/**', route => route.fulfill({ contentType: 'application/json', body: stockBody() }))
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.route('**/api/overview**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.goto('/stock/AAPL')
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(400)
}

const tog = (page: Page, label: string) =>
  page.locator('button.tog').filter({ has: page.getByText(label, { exact: true }) })
const oscTab = (page: Page, label: string) =>
  page.locator('button.osc-tab').filter({ hasText: new RegExp(`^${label.replace(/ /g, '\\s')}$`) })
const oscWrap = (page: Page) => page.locator('.osc-wrap')

test.describe('Oscillator subpanel (IndicatorPanel)', () => {
  test('default: MACD on → subpanel open, MACD tab active, RSI/Stoch tabs absent', async ({ page }) => {
    await setup(page)
    await expect(oscTab(page, 'MACD')).toBeVisible()
    await expect(oscTab(page, 'MACD')).toHaveClass(/active/)
    await expect(oscTab(page, 'RSI')).toHaveCount(0)
    await expect(oscTab(page, 'Stoch RSI')).toHaveCount(0)
  })

  test('enabling RSI adds its tab', async ({ page }) => {
    await setup(page)
    await tog(page, 'RSI').click()
    await expect(oscTab(page, 'RSI')).toBeVisible()
  })

  test('all three enabled → three tabs', async ({ page }) => {
    await setup(page)
    await tog(page, 'RSI').click()
    await tog(page, 'Stoch RSI').click()
    await expect(oscTab(page, 'MACD')).toBeVisible()
    await expect(oscTab(page, 'RSI')).toBeVisible()
    await expect(oscTab(page, 'Stoch RSI')).toBeVisible()
  })

  test('clicking a tab makes it active', async ({ page }) => {
    await setup(page)
    await tog(page, 'RSI').click()
    await oscTab(page, 'RSI').click()
    await expect(oscTab(page, 'RSI')).toHaveClass(/active/)
    await expect(oscTab(page, 'MACD')).not.toHaveClass(/active/)
  })

  test('disabling the only enabled oscillator collapses the subpanel', async ({ page }) => {
    await setup(page)
    await expect(oscWrap(page)).toBeVisible()
    const open = await oscWrap(page).evaluate(el => (el as HTMLElement).clientHeight)
    expect(open).toBeGreaterThan(0)

    await tog(page, 'MACD').click()
    await page.waitForTimeout(400)
    const collapsed = await oscWrap(page).evaluate(el => (el as HTMLElement).clientHeight)
    expect(collapsed).toBe(0)
  })

  test('value readouts are shown for the active tab', async ({ page }) => {
    await setup(page)
    await expect(page.locator('.osc-vals')).toContainText('MACD')
    await expect(page.locator('.osc-vals')).toContainText('signal')
    await expect(page.locator('.osc-vals')).toContainText('hist')
  })
})
