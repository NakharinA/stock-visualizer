import { test, expect, type Page } from '@playwright/test'

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
  await page.route('**/api/stock/**', route => route.fulfill({ contentType: 'application/json', body: STOCK_BODY }))
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
  await page.goto('/stock/AAPL')
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 8000 })
  await page.waitForTimeout(500)
}

// Nuxt UI v3 UCheckbox uses Reka UI's CheckboxRoot which renders <button role="checkbox">
// Use exact: true to avoid substring matches (e.g. 'EMA 20' matching 'EMA 200')
const cb = (page: Page, name: string) => page.getByRole('checkbox', { name, exact: true })

test.describe('IndicatorToggle component', () => {

  test('renders all 10 checkboxes', async ({ page }) => {
    await setup(page)
    await expect(page.locator('[role="checkbox"]')).toHaveCount(10)
  })

  test('all checkboxes unchecked by default', async ({ page }) => {
    await setup(page)
    const all = page.locator('[role="checkbox"]')
    const count = await all.count()
    for (let i = 0; i < count; i++) {
      await expect(all.nth(i)).not.toBeChecked()
    }
  })

  test('group labels are visible', async ({ page }) => {
    await setup(page)
    await expect(page.getByText('EMA Lines')).toBeVisible()
    await expect(page.getByText('Chart Overlays')).toBeVisible()
    await expect(page.getByText('Subpanel Indicators')).toBeVisible()
  })

  test('all EMA checkbox labels are visible', async ({ page }) => {
    await setup(page)
    await expect(page.getByText('EMA 20', { exact: true })).toBeVisible()
    await expect(page.getByText('EMA 50', { exact: true })).toBeVisible()
    await expect(page.getByText('EMA 100', { exact: true })).toBeVisible()
    await expect(page.getByText('EMA 200', { exact: true })).toBeVisible()
  })

  test('all overlay and subpanel labels are visible', async ({ page }) => {
    await setup(page)
    await expect(page.getByText('Fibonacci', { exact: true })).toBeVisible()
    await expect(page.getByText('Support / Resistance', { exact: true })).toBeVisible()
    await expect(page.getByText('Fair Value Gaps', { exact: true })).toBeVisible()
    await expect(page.getByText('MACD', { exact: true })).toBeVisible()
    await expect(page.getByText('RSI', { exact: true })).toBeVisible()
    await expect(page.getByText('Stoch RSI', { exact: true })).toBeVisible()
  })

  test('checking EMA 50: checkbox becomes checked', async ({ page }) => {
    await setup(page)
    await expect(cb(page, 'EMA 50')).not.toBeChecked()
    await cb(page, 'EMA 50').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'EMA 50')).toBeChecked()
  })

  test('unchecking EMA 50: checkbox returns to unchecked', async ({ page }) => {
    await setup(page)
    await cb(page, 'EMA 50').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'EMA 50')).toBeChecked()
    await cb(page, 'EMA 50').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'EMA 50')).not.toBeChecked()
  })

  test('checking Fibonacci: checkbox becomes checked', async ({ page }) => {
    await setup(page)
    await expect(cb(page, 'Fibonacci')).not.toBeChecked()
    await cb(page, 'Fibonacci').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'Fibonacci')).toBeChecked()
  })

  test('checking FVG: checkbox becomes checked', async ({ page }) => {
    await setup(page)
    await expect(cb(page, 'Fair Value Gaps')).not.toBeChecked()
    await cb(page, 'Fair Value Gaps').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'Fair Value Gaps')).toBeChecked()
  })

  test('checking MACD: checkbox becomes checked', async ({ page }) => {
    await setup(page)
    await expect(cb(page, 'MACD')).not.toBeChecked()
    await cb(page, 'MACD').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'MACD')).toBeChecked()
  })

  test('checking multiple indicators: each state is independent', async ({ page }) => {
    await setup(page)
    await cb(page, 'EMA 20').click()
    await cb(page, 'RSI').click()
    await page.waitForTimeout(200)
    await expect(cb(page, 'EMA 20')).toBeChecked()
    await expect(cb(page, 'RSI')).toBeChecked()
    await expect(cb(page, 'EMA 50')).not.toBeChecked()
    await expect(cb(page, 'MACD')).not.toBeChecked()
  })
})
