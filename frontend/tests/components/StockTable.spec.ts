import { test, expect, type Page } from '@playwright/test'

type OverviewItem = { symbol: string; price: number; diff_value: number; diff_pct: number }

const ITEMS: OverviewItem[] = [
  { symbol: 'AAPL', price: 189.50, diff_value: 2.30, diff_pct: 1.23 },
  { symbol: 'TSLA', price: 245.10, diff_value: -4.20, diff_pct: -3.31 },
  { symbol: 'GOOG', price: 100.00, diff_value: 0, diff_pct: 0 },
]

async function setupPage(page: Page, items: OverviewItem[]) {
  const symbols = items.map(i => i.symbol)
  await page.addInitScript(() => localStorage.removeItem('stock-watchlist'))
  await page.addInitScript((syms: string[]) => {
    localStorage.setItem('stock-watchlist', JSON.stringify(syms))
  }, symbols)
  await page.route('**/api/overview**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(items) })
  })
  await page.goto('/overview')
}

const dataRows = (page: Page) => page.locator('tr[role="button"]')

test.describe('StockTable component', () => {
  test('renders correct number of rows', async ({ page }) => {
    await setupPage(page, ITEMS)
    await expect(dataRows(page)).toHaveCount(3)
  })

  test('positive diff_value row has green color class', async ({ page }) => {
    await setupPage(page, ITEMS)
    const aaplRow = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(aaplRow.locator('span.text-green-500').first()).toBeVisible()
  })

  test('negative diff_value row has red color class', async ({ page }) => {
    await setupPage(page, ITEMS)
    const tslaRow = dataRows(page).filter({ hasText: 'TSLA' })
    await expect(tslaRow.locator('span.text-red-500').first()).toBeVisible()
  })

  test('zero diff_value row has no color class', async ({ page }) => {
    await setupPage(page, ITEMS)
    const googRow = dataRows(page).filter({ hasText: 'GOOG' })
    await expect(googRow.locator('span.text-green-500')).toHaveCount(0)
    await expect(googRow.locator('span.text-red-500')).toHaveCount(0)
  })

  test('price formatted as $189.50', async ({ page }) => {
    await setupPage(page, ITEMS)
    const aaplRow = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(aaplRow).toContainText('$189.50')
  })

  test('positive change formatted as +2.30', async ({ page }) => {
    await setupPage(page, ITEMS)
    const aaplRow = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(aaplRow).toContainText('+2.30')
  })

  test('change % formatted as +1.23%', async ({ page }) => {
    await setupPage(page, ITEMS)
    const aaplRow = dataRows(page).filter({ hasText: 'AAPL' })
    await expect(aaplRow).toContainText('+1.23%')
  })

  test('negative change formatted as -4.20 (not +-4.20)', async ({ page }) => {
    await setupPage(page, ITEMS)
    const tslaRow = dataRows(page).filter({ hasText: 'TSLA' })
    await expect(tslaRow).toContainText('-4.20')
    await expect(tslaRow).not.toContainText('+-4.20')
  })

  test('remove button causes row removal', async ({ page }) => {
    await setupPage(page, ITEMS)
    await expect(dataRows(page)).toHaveCount(3)

    await dataRows(page).filter({ hasText: 'AAPL' }).getByLabel('Remove').click()

    await expect(dataRows(page)).toHaveCount(2)
    await expect(dataRows(page).filter({ hasText: 'AAPL' })).toHaveCount(0)
  })

  test('row click emits row-click: navigates to /stock/TSLA', async ({ page }) => {
    await setupPage(page, ITEMS)
    await dataRows(page).filter({ hasText: 'TSLA' }).click()
    await expect(page).toHaveURL('/stock/TSLA')
  })

  test('remove button does not navigate away from /overview', async ({ page }) => {
    await setupPage(page, ITEMS)
    await dataRows(page).filter({ hasText: 'AAPL' }).getByLabel('Remove').click()
    await expect(page).toHaveURL('/overview')
  })

  test('loading: skeleton visible when fetch is pending', async ({ page }) => {
    const symbols = ITEMS.map(i => i.symbol)
    await page.addInitScript(() => localStorage.removeItem('stock-watchlist'))
    await page.addInitScript((syms: string[]) => {
      localStorage.setItem('stock-watchlist', JSON.stringify(syms))
    }, symbols)
    let resolveRoute!: () => void
    await page.route('**/api/overview**', async (route) => {
      await new Promise<void>(resolve => { resolveRoute = resolve })
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(ITEMS) })
    })
    await page.goto('/overview')
    await expect(page.locator('.h-10.w-full.rounded-lg').first()).toBeVisible({ timeout: 5000 })
    resolveRoute()
    await expect(dataRows(page)).toHaveCount(3)
  })
})
