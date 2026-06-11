import { test, expect, type Page } from '@playwright/test'

// Phase 10 redesign: subpanel (.osc-wrap) renders a tab (button.osc-tab) only for
// ENABLED oscillators; active tab carries class "active"; collapses to height 0
// when all oscillators are off. Defaults: MACD on (subpanel open).

type Bar = { time: string, open: number, high: number, low: number, close: number, volume: number }
function makeBars(n = 60): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02'); d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}
function stockResponse(symbol = 'AAPL', period = '3mo') {
  const bars = makeBars(60)
  return {
    symbol, period, ohlcv: bars,
    indicators: {
      ema20: [], ema50: [], ema100: [], ema200: [],
      macd: { macd: bars.map(b => ({ time: b.time, value: 0.5 })), signal: bars.map(b => ({ time: b.time, value: 0.3 })), histogram: bars.map(b => ({ time: b.time, value: 0.2 })) },
      rsi: bars.map(b => ({ time: b.time, value: 55 })),
      stoch_rsi: { k: bars.map(b => ({ time: b.time, value: 60 })), d: bars.map(b => ({ time: b.time, value: 55 })) },
      fibonacci: { high: 200, low: 100, levels: {} }, support_resistance: [], fvg: [],
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
const oscTab = (page: Page, label: string) =>
  page.locator('button.osc-tab').filter({ hasText: new RegExp(`^${label.replace(/ /g, '\\s')}$`) })
const oscWrap = (page: Page) => page.locator('.osc-wrap')
const wrapHeight = (page: Page) => oscWrap(page).evaluate(el => (el as HTMLElement).clientHeight)

test.describe('Indicator subpanel — E2E (redesigned)', () => {
  test('subpanel open by default (MACD on) with MACD tab active', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await expect(oscTab(page, 'MACD')).toBeVisible()
    await expect(oscTab(page, 'MACD')).toHaveClass(/active/)
  })

  test('enabling RSI adds its tab', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'RSI').click()
    await expect(oscTab(page, 'RSI')).toBeVisible()
  })

  test('switching to a different tab changes the active tab', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'RSI').click()
    await oscTab(page, 'RSI').click()
    await expect(oscTab(page, 'RSI')).toHaveClass(/active/)
    await expect(oscTab(page, 'MACD')).not.toHaveClass(/active/)
  })

  test('disabling the last oscillator collapses the subpanel (chart grows)', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    const open = await wrapHeight(page)
    expect(open).toBeGreaterThan(0)
    await tog(page, 'MACD').click()
    await page.waitForTimeout(400)
    expect(await wrapHeight(page)).toBe(0)
  })

  test('period switch preserves subpanel tab and indicator state', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'RSI').click()
    await expect(oscTab(page, 'MACD')).toHaveClass(/active/)
    await page.getByRole('button', { name: '1Y' }).click()
    await page.waitForTimeout(1200)
    await expect(oscTab(page, 'MACD')).toBeVisible()
    await expect(oscTab(page, 'RSI')).toBeVisible()
    await expect(oscTab(page, 'MACD')).toHaveClass(/active/)
  })

  test('all three enabled → three tabs', async ({ page }) => {
    await mockApis(page); await gotoChart(page)
    await tog(page, 'RSI').click()
    await tog(page, 'Stoch RSI').click()
    await expect(oscTab(page, 'MACD')).toBeVisible()
    await expect(oscTab(page, 'RSI')).toBeVisible()
    await expect(oscTab(page, 'Stoch RSI')).toBeVisible()
  })
})
