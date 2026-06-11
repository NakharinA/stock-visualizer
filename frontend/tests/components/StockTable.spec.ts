import { test, expect, type Page } from '@playwright/test'

// Phase 10 redesign: hand-built sortable table. Rows are still tr[role="button"]
// and remove is still aria-label="Remove". Up/down use .up/.down classes; the
// "Last" column is bare (no $), change uses fmtSigned, change% uses a delta pill.

type Item = {
  symbol: string, price: number, diff_value: number, diff_pct: number
  name?: string, sector?: string, volume?: number, spark?: number[]
}

const ITEMS: Item[] = [
  { symbol: 'AAPL', price: 189.50, diff_value: 2.30, diff_pct: 1.23, name: 'Apple', volume: 5e7, spark: [180, 185, 189] },
  { symbol: 'TSLA', price: 245.10, diff_value: -4.20, diff_pct: -3.31, name: 'Tesla', volume: 4e7, spark: [260, 250, 245] },
  { symbol: 'GOOG', price: 100.00, diff_value: 0, diff_pct: 0, name: 'Alphabet', volume: 2e7, spark: [100, 100, 100] },
]

async function setupPage(page: Page, items: Item[]) {
  const symbols = items.map(i => i.symbol)
  await page.addInitScript(() => localStorage.removeItem('stock-watchlist'))
  await page.addInitScript((syms: string[]) => {
    localStorage.setItem('stock-watchlist', JSON.stringify(syms))
  }, symbols)
  await page.route('**/api/overview**', async (route) => {
    // Honor the symbols query like the real backend so a post-remove refetch
    // returns only the remaining rows.
    const url = new URL(route.request().url())
    const want = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean)
    const body = want.map(s => items.find(i => i.symbol === s)).filter(Boolean)
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.goto('/overview')
}

const dataRows = (page: Page) => page.locator('tr[role="button"]')

test.describe('StockTable component (redesigned)', () => {
  test('renders correct number of rows', async ({ page }) => {
    await setupPage(page, ITEMS)
    await expect(dataRows(page)).toHaveCount(3)
  })

  test('positive change row uses up (green) class', async ({ page }) => {
    await setupPage(page, ITEMS)
    const row = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(row.locator('.up').first()).toBeVisible()
    await expect(row.locator('.down')).toHaveCount(0)
  })

  test('negative change row uses down (red) class', async ({ page }) => {
    await setupPage(page, ITEMS)
    const row = dataRows(page).filter({ hasText: 'TSLA' })
    await expect(row.locator('.down').first()).toBeVisible()
  })

  test('Last column renders the price without a $ prefix', async ({ page }) => {
    await setupPage(page, ITEMS)
    const row = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(row).toContainText('189.50')
  })

  test('positive change formatted as +2.30', async ({ page }) => {
    await setupPage(page, ITEMS)
    await expect(dataRows(page).filter({ hasText: 'AAPL' })).toContainText('+2.30')
  })

  test('change % shows +1.23%', async ({ page }) => {
    await setupPage(page, ITEMS)
    await expect(dataRows(page).filter({ hasText: 'AAPL' })).toContainText('+1.23%')
  })

  test('negative change formatted as -4.20 (not +-4.20)', async ({ page }) => {
    await setupPage(page, ITEMS)
    const row = dataRows(page).filter({ hasText: 'TSLA' })
    await expect(row).toContainText('-4.20')
    await expect(row).not.toContainText('+-4.20')
  })

  test('clicking a sortable header re-orders rows', async ({ page }) => {
    await setupPage(page, ITEMS)
    // Default sort by symbol asc → AAPL, GOOG, TSLA
    await expect(dataRows(page).nth(0)).toContainText('AAPL')
    // Sort by Last asc → GOOG (100), AAPL (189.5), TSLA (245.1)
    await page.locator('th', { hasText: 'Last' }).click()
    await expect(dataRows(page).nth(0)).toContainText('GOOG')
    // Toggle to desc → TSLA first
    await page.locator('th', { hasText: 'Last' }).click()
    await expect(dataRows(page).nth(0)).toContainText('TSLA')
  })

  test('remove button removes the row', async ({ page }) => {
    await setupPage(page, ITEMS)
    await dataRows(page).filter({ hasText: 'AAPL' }).getByLabel('Remove').click()
    await expect(dataRows(page)).toHaveCount(2)
    await expect(dataRows(page).filter({ hasText: 'AAPL' })).toHaveCount(0)
  })

  test('row click navigates to /stock/TSLA', async ({ page }) => {
    await setupPage(page, ITEMS)
    await dataRows(page).filter({ hasText: 'TSLA' }).click()
    await expect(page).toHaveURL('/stock/TSLA')
  })

  test('remove does not navigate away from /overview', async ({ page }) => {
    await setupPage(page, ITEMS)
    await dataRows(page).filter({ hasText: 'AAPL' }).getByLabel('Remove').click()
    await expect(page).toHaveURL('/overview')
  })

  test('loading: skeleton visible while fetch is pending', async ({ page }) => {
    const symbols = ITEMS.map(i => i.symbol)
    await page.addInitScript(() => localStorage.removeItem('stock-watchlist'))
    await page.addInitScript((syms: string[]) => {
      localStorage.setItem('stock-watchlist', JSON.stringify(syms))
    }, symbols)
    let resolveRoute!: () => void
    await page.route('**/api/overview**', async (route) => {
      await new Promise<void>((resolve) => { resolveRoute = resolve })
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(ITEMS) })
    })
    await page.goto('/overview')
    await expect(page.locator('.h-10.w-full.rounded-lg').first()).toBeVisible({ timeout: 5000 })
    resolveRoute()
    await expect(dataRows(page)).toHaveCount(3)
  })
})
