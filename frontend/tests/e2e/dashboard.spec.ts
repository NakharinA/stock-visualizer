import { test, expect, type Page } from '@playwright/test'

// Phase 10 Dashboard: index cards (SPY/QQQ/NVDA/AAPL), watchlist grid, movers.

async function mock(page: Page) {
  await page.route('**/api/overview**', async (route) => {
    const url = new URL(route.request().url())
    const syms = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean)
    // Deterministic, varied pct so gainers/losers split cleanly.
    const body = syms.map((s, i) => {
      const pct = ((i % 9) - 4) * 1.25
      return { symbol: s, price: 100 + i, diff_value: pct, diff_pct: pct, name: s + ' Inc', sector: 'Tech', volume: 1e7, spark: [98, 99, 100 + i, 101 + i] }
    })
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(body) })
  })
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))
}

async function setWatchlist(page: Page, symbols: string[]) {
  await page.addInitScript(s => localStorage.setItem('stock-watchlist', JSON.stringify(s)), symbols)
}

test.describe('Dashboard', () => {
  test('renders 4 index cards', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.locator('.idx-card')).toHaveCount(4)
  })

  test('index card navigates to its chart', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.locator('.idx-card').first()).toBeVisible()
    await page.locator('.idx-card').first().click()
    await expect(page).toHaveURL('/stock/SPY')
  })

  test('watchlist grid reflects saved symbols', async ({ page }) => {
    await setWatchlist(page, ['AAPL', 'MSFT', 'TSLA'])
    await mock(page)
    await page.goto('/')
    await expect(page.locator('.wl-card')).toHaveCount(3)
  })

  test('empty watchlist shows the empty-state message', async ({ page }) => {
    await setWatchlist(page, [])
    await mock(page)
    await page.goto('/')
    await expect(page.getByText('No symbols yet. Add some from the Overview page.')).toBeVisible()
    await expect(page.locator('.wl-card')).toHaveCount(0)
  })

  test('movers panel shows gainers and losers', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.getByText('Movers today')).toBeVisible()
    await expect(page.locator('.mv-h.up', { hasText: 'Gainers' })).toBeVisible()
    await expect(page.locator('.mv-h.down', { hasText: 'Losers' })).toBeVisible()
    await expect(page.locator('.mv-row')).toHaveCount(10)
  })

  test('greeting hero and market status render', async ({ page }) => {
    await mock(page)
    await page.goto('/')
    await expect(page.locator('.dash-hero .h1')).toBeVisible()
    await expect(page.getByText('Markets open')).toBeVisible()
  })
})
