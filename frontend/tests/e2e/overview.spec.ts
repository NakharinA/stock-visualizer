import { test, expect, type Page } from '@playwright/test'

const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY']

type OverviewItem = { symbol: string; price: number; diff_value: number; diff_pct: number }

const MOCK_DB: Record<string, OverviewItem> = {
  AAPL: { symbol: 'AAPL', price: 189.50, diff_value: 2.30, diff_pct: 1.23 },
  TSLA: { symbol: 'TSLA', price: 245.10, diff_value: -8.40, diff_pct: -3.31 },
  NVDA: { symbol: 'NVDA', price: 875.20, diff_value: 15.60, diff_pct: 1.82 },
  MSFT: { symbol: 'MSFT', price: 415.80, diff_value: -2.10, diff_pct: -0.50 },
  AMZN: { symbol: 'AMZN', price: 182.30, diff_value: 3.70, diff_pct: 2.07 },
  GOOGL: { symbol: 'GOOGL', price: 178.90, diff_value: 0.80, diff_pct: 0.45 },
  META: { symbol: 'META', price: 512.40, diff_value: 8.20, diff_pct: 1.63 },
  SPY: { symbol: 'SPY', price: 527.60, diff_value: 1.40, diff_pct: 0.27 },
  NFLX: { symbol: 'NFLX', price: 685.30, diff_value: 12.50, diff_pct: 1.86 },
}

async function mockOverview(
  page: Page,
  { delay = 0, status = 200 }: { delay?: number; status?: number } = {},
) {
  await page.route('**/api/overview**', async (route) => {
    if (status !== 200) {
      await route.fulfill({ status, body: '{"detail":"error"}', contentType: 'application/json' })
      return
    }
    if (delay > 0) await new Promise(r => setTimeout(r, delay))
    const url = new URL(route.request().url())
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean)
    const items = symbols.map(s => MOCK_DB[s] ?? { symbol: s, price: 100, diff_value: 0, diff_pct: 0 })
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(items) })
  })
}

async function setWatchlist(page: Page, symbols: string[]) {
  await page.addInitScript((syms: string[]) => {
    localStorage.setItem('stock-watchlist', JSON.stringify(syms))
  }, symbols)
}

const dataRows = (page: Page) => page.locator('tr[role="button"]')

test.describe('Overview page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('stock-watchlist'))
  })

  test('first visit: shows 8 default symbols', async ({ page }) => {
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(8)
    const stored = await page.evaluate(() => localStorage.getItem('stock-watchlist'))
    expect(JSON.parse(stored!)).toEqual(DEFAULT_SYMBOLS)
  })

  test('returning visit: shows saved watchlist symbols', async ({ page }) => {
    await setWatchlist(page, ['NFLX', 'AMZN'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(2)
    await expect(page.getByText('NFLX')).toBeVisible()
    await expect(page.getByText('AMZN')).toBeVisible()
  })

  test('add symbol: new row appears and persists in localStorage', async ({ page }) => {
    await setWatchlist(page, ['AAPL'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(1)

    await page.getByPlaceholder('Add symbol (e.g. NFLX)').fill('nflx')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(dataRows(page)).toHaveCount(2)
    await expect(page.getByText('NFLX')).toBeVisible()
    const stored = await page.evaluate(() => localStorage.getItem('stock-watchlist'))
    expect(JSON.parse(stored!)).toContain('NFLX')
  })

  test('duplicate add: shows warning, no duplicate row', async ({ page }) => {
    await setWatchlist(page, ['AAPL'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(1)

    await page.getByPlaceholder('Add symbol (e.g. NFLX)').fill('AAPL')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.getByText('Already in watchlist')).toBeVisible()
    await expect(dataRows(page)).toHaveCount(1)
  })

  test('remove symbol: row disappears and localStorage updates', async ({ page }) => {
    await setWatchlist(page, ['AAPL', 'TSLA'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(2)

    await dataRows(page).filter({ hasText: 'TSLA' }).getByLabel('Remove').click()

    await expect(dataRows(page)).toHaveCount(1)
    await expect(page.locator('tr[role="button"]', { hasText: 'TSLA' })).toHaveCount(0)
    const stored = await page.evaluate(() => localStorage.getItem('stock-watchlist'))
    expect(JSON.parse(stored!)).not.toContain('TSLA')
  })

  test('row click: navigates to /stock/[symbol]', async ({ page }) => {
    await setWatchlist(page, ['NVDA'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(1)

    await dataRows(page).first().click()

    await expect(page).toHaveURL('/stock/NVDA')
  })

  test('remove button: stays on /overview (no navigation)', async ({ page }) => {
    await setWatchlist(page, ['AAPL'])
    await mockOverview(page)
    await page.goto('/overview')
    await expect(dataRows(page)).toHaveCount(1)

    await dataRows(page).first().getByLabel('Remove').click()

    await expect(page).toHaveURL('/overview')
  })

  test('loading state: skeleton visible during fetch', async ({ page }) => {
    let resolveRoute!: () => void
    await page.route('**/api/overview**', async (route) => {
      await new Promise<void>(resolve => { resolveRoute = resolve })
      await route.fulfill({ contentType: 'application/json', body: '[]' })
    })
    await page.goto('/overview')
    await expect(page.locator('.h-10.w-full.rounded-lg').first()).toBeVisible({ timeout: 5000 })
    resolveRoute()
  })

  test('error state: shows error message when API fails', async ({ page }) => {
    await mockOverview(page, { status: 500 })
    await page.goto('/overview')
    await expect(page.getByText(/Failed to load stock data/)).toBeVisible()
    await expect(dataRows(page)).toHaveCount(0)
  })
})
