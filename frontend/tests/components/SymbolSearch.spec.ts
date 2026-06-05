import { test, expect, type Page } from '@playwright/test'

const SEARCH_RESULTS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
]

const MINIMAL_STOCK_BODY = JSON.stringify({
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

async function setup(page: Page, { withResults = false } = {}) {
  await page.route('**/api/stock/**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: MINIMAL_STOCK_BODY })
  })
  await page.route('**/api/search**', async (route) => {
    const body = withResults ? JSON.stringify(SEARCH_RESULTS) : '[]'
    await route.fulfill({ contentType: 'application/json', body })
  })
  await page.goto('/stock/AAPL')
  await page.waitForTimeout(1000)
}

const searchInput = (page: Page) => page.locator('input').first()

async function openDropdown(page: Page) {
  await searchInput(page).click()
  await searchInput(page).fill('any')
  await page.waitForTimeout(500)
}

test.describe('SymbolSearch component', () => {
  test('empty results: no dropdown rendered when focused without results', async ({ page }) => {
    await setup(page, { withResults: false })
    await searchInput(page).click()
    await page.waitForTimeout(200)
    await expect(page.locator('button').filter({ hasText: 'NVDA' })).toHaveCount(0)
    await expect(page.locator('button').filter({ hasText: 'TSLA' })).toHaveCount(0)
  })

  test('non-empty results: dropdown visible when results prop is populated', async ({ page }) => {
    await setup(page, { withResults: true })
    await openDropdown(page)
    await expect(page.getByText('NVDA')).toBeVisible()
    await expect(page.getByText('TSLA')).toBeVisible()
  })

  test('item format: each result shows SYMBOL — Name', async ({ page }) => {
    await setup(page, { withResults: true })
    await openDropdown(page)
    const nvdaItem = page.locator('button').filter({ hasText: 'NVDA' }).first()
    await expect(nvdaItem).toContainText('NVDA')
    await expect(nvdaItem).toContainText('NVIDIA Corporation')
    await expect(nvdaItem).toContainText('—')
  })

  test('select emits event: clicking result navigates to /stock/NVDA', async ({ page }) => {
    await setup(page, { withResults: true })
    await openDropdown(page)
    await page.locator('button').filter({ hasText: 'NVDA' }).first().click()
    await expect(page).toHaveURL('/stock/NVDA', { timeout: 3000 })
  })

  test('debounced search: not fired immediately, fired after 300ms', async ({ page }) => {
    const requestTimes: number[] = []
    await page.route('**/api/search**', async (route) => {
      requestTimes.push(Date.now())
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(SEARCH_RESULTS) })
    })
    await page.route('**/api/stock/**', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: MINIMAL_STOCK_BODY })
    })
    await page.goto('/stock/AAPL')
    await page.waitForTimeout(1000)

    await searchInput(page).click()
    const fillTime = Date.now()
    await searchInput(page).fill('nvid')

    await page.waitForTimeout(200) // 200ms: debounce hasn't fired yet
    expect(requestTimes.length).toBe(0)

    await page.waitForTimeout(200) // 400ms total: debounce has fired
    expect(requestTimes.length).toBe(1)
    expect(requestTimes[0] - fillTime).toBeGreaterThan(280)
  })

  test('Escape key closes dropdown', async ({ page }) => {
    await setup(page, { withResults: true })
    await openDropdown(page)
    await expect(page.getByText('NVDA')).toBeVisible()

    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(page.getByText('NVDA')).not.toBeVisible()
  })

  test('click outside closes dropdown', async ({ page }) => {
    await setup(page, { withResults: true })
    await openDropdown(page)
    await expect(page.getByText('NVDA')).toBeVisible()

    // Tab key moves focus away from the input, triggering onBlur
    await page.keyboard.press('Tab')
    await page.waitForTimeout(300)

    await expect(page.getByText('NVDA')).not.toBeVisible()
  })

  test('shows current symbol as placeholder when not focused', async ({ page }) => {
    await setup(page)
    await expect(searchInput(page)).toHaveAttribute('placeholder', 'AAPL')
  })
})
