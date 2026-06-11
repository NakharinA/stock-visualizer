import { test, expect, type Page } from '@playwright/test'

// Phase 10 redesign: the indicator panel is now a right-side rail of switch
// toggles (button.tog with aria-pressed), grouped "Overlays" / "Oscillators".
// Defaults (from useIndicatorState): ema20, ema50, supportResistance, fvg, macd ON.

const STOCK_BODY = JSON.stringify({
  symbol: 'AAPL', period: '3mo',
  ohlcv: [{ time: '2024-01-02', open: 180, high: 185, low: 175, close: 182, volume: 1e6 }],
  indicators: {
    ema20: [], ema50: [], ema100: [], ema200: [],
    macd: { macd: [], signal: [], histogram: [] },
    rsi: [], stoch_rsi: { k: [], d: [] },
    fibonacci: { high: 0, low: 0, levels: {} },
    support_resistance: [], fvg: [],
  },
})

async function setup(page: Page) {
  await page.addInitScript(() => localStorage.removeItem('sv.tog'))
  await page.route('**/api/stock/**', route => route.fulfill({ contentType: 'application/json', body: STOCK_BODY }))
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.route('**/api/overview**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.goto('/stock/AAPL')
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(400)
}

// A rail toggle is a `button.tog` whose label span matches exactly.
const tog = (page: Page, label: string) =>
  page.locator('button.tog').filter({ has: page.getByText(label, { exact: true }) })

test.describe('Indicator rail (IndicatorToggle)', () => {
  test('renders all 10 toggles', async ({ page }) => {
    await setup(page)
    await expect(page.locator('button.tog')).toHaveCount(10)
  })

  test('group headers are visible', async ({ page }) => {
    await setup(page)
    await expect(page.getByText('Overlays', { exact: true })).toBeVisible()
    await expect(page.getByText('Oscillators', { exact: true })).toBeVisible()
  })

  test('all toggle labels are visible', async ({ page }) => {
    await setup(page)
    for (const l of ['EMA 20', 'EMA 50', 'EMA 100', 'EMA 200', 'Fibonacci', 'Support / Resistance', 'Fair Value Gap']) {
      await expect(tog(page, l)).toBeVisible()
    }
    await expect(tog(page, 'MACD')).toBeVisible()
    await expect(tog(page, 'RSI')).toBeVisible()
    await expect(tog(page, 'Stoch RSI')).toBeVisible()
  })

  test('default-on set: ema20, ema50, Support / Resistance, FVG, MACD', async ({ page }) => {
    await setup(page)
    for (const on of ['EMA 20', 'EMA 50', 'Support / Resistance', 'Fair Value Gap', 'MACD']) {
      await expect(tog(page, on)).toHaveAttribute('aria-pressed', 'true')
    }
    for (const off of ['EMA 100', 'EMA 200', 'Fibonacci', 'RSI', 'Stoch RSI']) {
      await expect(tog(page, off)).toHaveAttribute('aria-pressed', 'false')
    }
  })

  test('enabling EMA 100 flips it on', async ({ page }) => {
    await setup(page)
    await expect(tog(page, 'EMA 100')).toHaveAttribute('aria-pressed', 'false')
    await tog(page, 'EMA 100').click()
    await expect(tog(page, 'EMA 100')).toHaveAttribute('aria-pressed', 'true')
  })

  test('disabling EMA 20 flips it off', async ({ page }) => {
    await setup(page)
    await expect(tog(page, 'EMA 20')).toHaveAttribute('aria-pressed', 'true')
    await tog(page, 'EMA 20').click()
    await expect(tog(page, 'EMA 20')).toHaveAttribute('aria-pressed', 'false')
  })

  test('toggles are independent (Fibonacci does not affect EMA 200)', async ({ page }) => {
    await setup(page)
    await tog(page, 'Fibonacci').click()
    await expect(tog(page, 'Fibonacci')).toHaveAttribute('aria-pressed', 'true')
    await expect(tog(page, 'EMA 200')).toHaveAttribute('aria-pressed', 'false')
  })

  test('exact-label matching: EMA 20 toggle is distinct from EMA 200', async ({ page }) => {
    await setup(page)
    await expect(tog(page, 'EMA 20')).toHaveCount(1)
    await expect(tog(page, 'EMA 200')).toHaveCount(1)
  })
})
