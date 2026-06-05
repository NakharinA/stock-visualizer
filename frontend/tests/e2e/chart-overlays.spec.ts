import { test, expect, type Page } from '@playwright/test'

type Bar = { time: string; open: number; high: number; low: number; close: number; volume: number }

function makeBars(n = 30): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02')
    d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}

function stockResponse(symbol = 'AAPL', period = '3mo') {
  const bars = makeBars(30)
  return {
    symbol, period,
    ohlcv: bars,
    indicators: {
      ema20: bars.map(b => ({ time: b.time, value: 182 })),
      ema50: bars.map(b => ({ time: b.time, value: 180 })),
      ema100: bars.map(b => ({ time: b.time, value: 178 })),
      ema200: bars.map(b => ({ time: b.time, value: 175 })),
      macd: { macd: [], signal: [], histogram: [] },
      rsi: [],
      stoch_rsi: { k: [], d: [] },
      fibonacci: {
        high: 200,
        low: 100,
        levels: {
          '0': 100,
          '0.236': 123.6,
          '0.382': 138.2,
          '0.5': 150,
          '0.618': 161.8,
          '0.786': 178.6,
          '1.0': 200,
        },
      },
      support_resistance: [160, 170, 180],
      fvg: [
        { type: 'bullish' as const, top: 185, bottom: 182, time: '2024-01-15' },
        { type: 'bearish' as const, top: 175, bottom: 172, time: '2024-01-20' },
      ],
    },
  }
}

async function mockApis(page: Page) {
  await page.route('**/api/stock/**', async (route) => {
    const url = new URL(route.request().url())
    const parts = url.pathname.split('/')
    const sym = parts[parts.length - 1] ?? 'AAPL'
    const period = url.searchParams.get('period') ?? '3mo'
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
  })
  await page.route('**/api/search**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: '[]' })
  })
}

async function gotoChart(page: Page) {
  await page.goto('/stock/AAPL')
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(500)
}

// Nuxt UI v3 sets aria-label on CheckboxRoot buttons — use exact: true to avoid substring matches
const ema20 = (page: Page) => page.getByRole('checkbox', { name: 'EMA 20', exact: true })
const ema50 = (page: Page) => page.getByRole('checkbox', { name: 'EMA 50', exact: true })
const fibonacci = (page: Page) => page.getByRole('checkbox', { name: 'Fibonacci', exact: true })
const supportResistance = (page: Page) => page.getByRole('checkbox', { name: 'Support / Resistance', exact: true })
const fairValueGaps = (page: Page) => page.getByRole('checkbox', { name: 'Fair Value Gaps', exact: true })

test.describe('Chart Indicator Overlays — E2E', () => {

  test('Fibonacci disabled by default: checkbox is unchecked', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)
    await expect(fibonacci(page)).not.toBeChecked()
  })

  test('Enable Fibonacci: checkbox becomes checked and chart stays functional', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)
    await fibonacci(page).click()
    await page.waitForTimeout(400)
    await expect(fibonacci(page)).toBeChecked()
    // LWC v5 renders price lines on canvas; verify chart canvas is still functional
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('Disable Fibonacci: checkbox returns to unchecked after second click', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)
    await fibonacci(page).click()
    await page.waitForTimeout(400)
    await expect(fibonacci(page)).toBeChecked()

    await fibonacci(page).click()
    await page.waitForTimeout(400)
    await expect(fibonacci(page)).not.toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('Support/Resistance: checkbox toggles and chart stays functional', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)
    await expect(supportResistance(page)).not.toBeChecked()
    await supportResistance(page).click()
    await page.waitForTimeout(300)
    await expect(supportResistance(page)).toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('FVG: checkbox toggles and chart stays functional', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)
    await expect(fairValueGaps(page)).not.toBeChecked()
    await fairValueGaps(page).click()
    await page.waitForTimeout(300)
    await expect(fairValueGaps(page)).toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('EMA 20 on/off: checkbox toggles, chart remains functional', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)

    await expect(ema20(page)).not.toBeChecked()
    await ema20(page).click()
    await page.waitForTimeout(300)
    await expect(ema20(page)).toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()

    await ema20(page).click()
    await page.waitForTimeout(300)
    await expect(ema20(page)).not.toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('Multiple EMA: unchecking EMA 20 does not affect EMA 50', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)

    await ema20(page).click()
    await ema50(page).click()
    await page.waitForTimeout(300)
    await expect(ema20(page)).toBeChecked()
    await expect(ema50(page)).toBeChecked()

    await ema20(page).click()
    await page.waitForTimeout(300)
    await expect(ema20(page)).not.toBeChecked()
    await expect(ema50(page)).toBeChecked()
  })

  test('Period switch preserves toggle state: EMA 20 stays checked after period change', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)

    await ema20(page).click()
    await page.waitForTimeout(300)
    await expect(ema20(page)).toBeChecked()

    await page.getByRole('button', { name: '1Y' }).click()
    await page.waitForTimeout(1500)

    await expect(ema20(page)).toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })

  test('Independent toggles: enabling Fibonacci does not enable S/R', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)

    await fibonacci(page).click()
    await page.waitForTimeout(300)

    await expect(fibonacci(page)).toBeChecked()
    await expect(supportResistance(page)).not.toBeChecked()
    await expect(fairValueGaps(page)).not.toBeChecked()
  })

  test('All indicators can be toggled independently without affecting each other', async ({ page }) => {
    await mockApis(page)
    await gotoChart(page)

    await fibonacci(page).click()
    await supportResistance(page).click()
    await fairValueGaps(page).click()
    await ema20(page).click()
    await page.waitForTimeout(500)

    // Disable Fibonacci only — rest remain enabled
    await fibonacci(page).click()
    await page.waitForTimeout(300)

    await expect(fibonacci(page)).not.toBeChecked()
    await expect(supportResistance(page)).toBeChecked()
    await expect(fairValueGaps(page)).toBeChecked()
    await expect(ema20(page)).toBeChecked()
    await expect(page.locator('canvas').first()).toBeVisible()
  })
})
