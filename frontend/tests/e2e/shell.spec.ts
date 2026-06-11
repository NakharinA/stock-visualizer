import { test, expect, type Page } from '@playwright/test'

// Phase 10 shell: 78px icon-rail sidebar (Dashboard / Chart / Watchlist) +
// topbar with global symbol search and SPY/QQQ index chips.

function overviewBody(symbols: string[]) {
  return JSON.stringify(symbols.map((s, i) => ({
    symbol: s, price: 100 + i, diff_value: i - 1, diff_pct: (i - 1) * 0.5,
    name: s + ' Inc', sector: 'Tech', volume: 1e7, spark: [98, 99, 100 + i],
  })))
}

async function mock(page: Page, search: { symbol: string, name: string }[] = []) {
  await page.route('**/api/overview**', async (route) => {
    const url = new URL(route.request().url())
    const syms = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean)
    await route.fulfill({ contentType: 'application/json', body: overviewBody(syms) })
  })
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(search) }))
  await page.route('**/api/stock/**', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ symbol: 'AAPL', period: '3mo', ohlcv: [{ time: '2024-01-02', open: 1, high: 2, low: 1, close: 2, volume: 1 }], indicators: { ema20: [], ema50: [], ema100: [], ema200: [], macd: { macd: [], signal: [], histogram: [] }, rsi: [], stoch_rsi: { k: [], d: [] }, fibonacci: { high: 0, low: 0, levels: {} }, support_resistance: [], fvg: [] } }),
  }))
}

const searchInput = (page: Page) => page.locator('input.search-input')

test.describe('App shell', () => {
  test('sidebar shows the three nav items', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Chart' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Watchlist' })).toBeVisible()
  })

  test('sidebar Watchlist navigates to /overview', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await page.getByRole('button', { name: 'Watchlist' }).click()
    await expect(page).toHaveURL('/overview')
  })

  test('topbar index chips render (SPY, QQQ)', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.locator('.idx-chip', { hasText: 'SPY' })).toBeVisible()
    await expect(page.locator('.idx-chip', { hasText: 'QQQ' })).toBeVisible()
  })

  test('topbar search autocompletes and navigates on select', async ({ page }) => {
    await mock(page, [{ symbol: 'NVDA', name: 'NVIDIA Corporation' }])
    await page.goto('/')
    await searchInput(page).click()
    await searchInput(page).fill('nvid')
    await expect(page.locator('.sr-item', { hasText: 'NVDA' })).toBeVisible({ timeout: 3000 })
    await expect(page.getByText('NVIDIA Corporation')).toBeVisible()
    await page.locator('.sr-item', { hasText: 'NVDA' }).click()
    await expect(page).toHaveURL('/stock/NVDA')
  })

  test('search debounces (no request before ~250ms)', async ({ page }) => {
    const times: number[] = []
    await page.route('**/api/search**', async (route) => {
      times.push(Date.now())
      await route.fulfill({ contentType: 'application/json', body: '[]' })
    })
    await page.route('**/api/overview**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
    await page.goto('/')
    await searchInput(page).click()
    const t0 = Date.now()
    await searchInput(page).fill('nvid')
    await page.waitForTimeout(120)
    expect(times.length).toBe(0)
    await page.waitForTimeout(300)
    expect(times.length).toBeGreaterThanOrEqual(1)
    expect(times[0] - t0).toBeGreaterThan(200)
  })

  test('Escape closes the search dropdown', async ({ page }) => {
    await mock(page, [{ symbol: 'NVDA', name: 'NVIDIA Corporation' }])
    await page.goto('/')
    await searchInput(page).click()
    await searchInput(page).fill('nvid')
    await expect(page.locator('.sr-item', { hasText: 'NVDA' })).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(page.locator('.sr-item', { hasText: 'NVDA' })).toHaveCount(0)
  })
})
