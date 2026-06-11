import { test, expect, type Page } from '@playwright/test'

// Phase 10: polish coverage retargeted to the redesigned shell/pages.

type Bar = { time: string, open: number, high: number, low: number, close: number, volume: number }
function makeBars(n = 30): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02'); d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}
function stockResponse(symbol: string, period = '3mo') {
  return {
    symbol, period, ohlcv: makeBars(30),
    indicators: {
      ema20: [], ema50: [], ema100: [], ema200: [],
      macd: { macd: [], signal: [], histogram: [] }, rsi: [], stoch_rsi: { k: [], d: [] },
      fibonacci: { high: 0, low: 0, levels: {} }, support_resistance: [], fvg: [],
    },
  }
}

async function mockStock(page: Page, { delay = 0 } = {}) {
  await page.route('**/api/stock/**', async (route) => {
    if (delay > 0) await new Promise(r => setTimeout(r, delay))
    const url = new URL(route.request().url())
    const sym = url.pathname.split('/').pop() ?? 'AAPL'
    const period = url.searchParams.get('period') ?? '3mo'
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
  })
}
async function mockSearch(page: Page, results: { symbol: string, name: string }[] = []) {
  await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(results) }))
}
async function mockOverview(page: Page, { status = 200 }: { status?: number } = {}) {
  await page.route('**/api/overview**', async (route) => {
    if (status !== 200) { await route.fulfill({ status, contentType: 'application/json', body: '{"detail":"error"}' }); return }
    const url = new URL(route.request().url())
    const symbols = (url.searchParams.get('symbols') ?? '').split(',').filter(Boolean)
    const items = symbols.map(s => ({ symbol: s, price: 100, diff_value: 1.2, diff_pct: 0.5, name: s, sector: '', volume: 1e7, spark: [99, 100, 101] }))
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(items) })
  })
}
async function setWatchlist(page: Page, symbols: string[]) {
  await page.addInitScript(s => localStorage.setItem('stock-watchlist', JSON.stringify(s)), symbols)
}

function isDark(value: string): boolean {
  const oklch = value.match(/oklch\(\s*([\d.]+)/i)
  if (oklch) return Number.parseFloat(oklch[1]) < 0.5
  const nums = (value.match(/\d+(\.\d+)?/g) ?? []).map(Number)
  const [r = 0, g = 0, b = 0] = nums
  return (r + g + b) / 3 < 80
}
const bodyBg = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor)

// --------------------------------------------------------------------------
test.describe('Polish: loading states', () => {
  test('chart skeleton visible while data loads, gone after', async ({ page }) => {
    let resolveRoute!: () => void
    const pending = new Promise<void>((r) => { resolveRoute = r })
    await page.route('**/api/stock/**', async (route) => { await pending; await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse('AAPL')) }) })
    await mockSearch(page); await mockOverview(page)

    await page.goto('/stock/AAPL')
    await expect(page.locator('.animate-pulse').first()).toBeVisible({ timeout: 5000 })
    resolveRoute()
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.animate-pulse')).toHaveCount(0)
  })

  test('overview skeleton rows visible during load', async ({ page }) => {
    await setWatchlist(page, ['AAPL', 'TSLA'])
    let resolveRoute!: () => void
    await page.route('**/api/overview**', async (route) => { await new Promise<void>((resolve) => { resolveRoute = resolve }); await route.fulfill({ contentType: 'application/json', body: '[]' }) })
    await page.goto('/overview')
    await expect(page.locator('.h-10.w-full.rounded-lg').first()).toBeVisible({ timeout: 5000 })
    resolveRoute()
  })
})

// --------------------------------------------------------------------------
test.describe('Polish: error states', () => {
  test('chart 404 shows error alert and no canvas', async ({ page }) => {
    await page.route('**/api/stock/**', route => route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"not found"}' }))
    await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/XXXXINVALID')
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 5000 })
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('chart 500 shows generic error alert', async ({ page }) => {
    await page.route('**/api/stock/**', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"detail":"boom"}' }))
    await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/AAPL')
    await expect(page.getByText(/Failed to load chart data/i)).toBeVisible({ timeout: 5000 })
  })

  test('chart retry button re-triggers API and renders chart on success', async ({ page }) => {
    let shouldFail = true
    await page.route('**/api/stock/**', async (route) => {
      if (shouldFail) { await route.fulfill({ status: 500, contentType: 'application/json', body: '{"detail":"boom"}' }); return }
      const url = new URL(route.request().url())
      const sym = url.pathname.split('/').pop() ?? 'AAPL'
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym)) })
    })
    await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/AAPL')
    await expect(page.getByText(/Failed to load chart data/i)).toBeVisible({ timeout: 5000 })
    shouldFail = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
  })

  test('overview error alert shows on failing API', async ({ page }) => {
    await setWatchlist(page, ['AAPL', 'TSLA'])
    await mockOverview(page, { status: 500 })
    await page.goto('/overview')
    await expect(page.getByText(/Failed to load stock data/i)).toBeVisible({ timeout: 5000 })
  })

  test('overview error has a working retry button', async ({ page }) => {
    await setWatchlist(page, ['AAPL'])
    let shouldFail = true
    await page.route('**/api/overview**', async (route) => {
      if (shouldFail) { await route.fulfill({ status: 500, contentType: 'application/json', body: '{"detail":"boom"}' }); return }
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify([{ symbol: 'AAPL', price: 100, diff_value: 1, diff_pct: 1, name: 'Apple', sector: '', volume: 1e7, spark: [99, 100] }]) })
    })
    await page.goto('/overview')
    await expect(page.getByText(/Failed to load stock data/i)).toBeVisible({ timeout: 5000 })
    shouldFail = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.locator('tr[role="button"]')).toHaveCount(1)
  })
})

// --------------------------------------------------------------------------
test.describe('Polish: dark theme', () => {
  test('stock chart page body is dark', async ({ page }) => {
    await mockStock(page); await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    expect(isDark(await bodyBg(page))).toBe(true)
  })

  test('overview page body is dark', async ({ page }) => {
    await setWatchlist(page, ['AAPL']); await mockOverview(page)
    await page.goto('/overview')
    expect(isDark(await bodyBg(page))).toBe(true)
  })

  test('dashboard page body is dark', async ({ page }) => {
    await mockOverview(page)
    await page.goto('/')
    expect(isDark(await bodyBg(page))).toBe(true)
  })

  test('chart canvas sits on a dark surface (no white background)', async ({ page }) => {
    await mockStock(page); await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    const bg = await page.locator('canvas').first().evaluate((el) => {
      let node: HTMLElement | null = el as HTMLElement
      while (node) {
        const c = getComputedStyle(node).backgroundColor
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c
        node = node.parentElement
      }
      return getComputedStyle(document.body).backgroundColor
    })
    expect(isDark(bg)).toBe(true)
  })
})

// --------------------------------------------------------------------------
test.describe('Polish: responsive layout', () => {
  test('chart page at 1280px has no horizontal scrollbar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await mockStock(page); await mockSearch(page); await mockOverview(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })

  test('overview table present at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await setWatchlist(page, ['AAPL', 'TSLA']); await mockOverview(page)
    await page.goto('/overview')
    await expect(page.locator('tr[role="button"]').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.tbl-wrap')).toBeVisible()
  })
})

// --------------------------------------------------------------------------
test.describe('Polish: navigation regression', () => {
  test('dashboard → watchlist via sidebar, no full reload', async ({ page }) => {
    await setWatchlist(page, ['AAPL']); await mockOverview(page); await mockStock(page); await mockSearch(page)
    await page.goto('/')
    await page.evaluate(() => { (window as unknown as { __noReload: boolean }).__noReload = true })
    await page.locator('.nav-i', { hasText: 'Watchlist' }).click()
    await expect(page).toHaveURL('/overview')
    expect(await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload === true)).toBe(true)
  })

  test('overview → stock via row click', async ({ page }) => {
    await setWatchlist(page, ['NVDA']); await mockOverview(page); await mockStock(page); await mockSearch(page)
    await page.goto('/overview')
    await page.locator('tr[role="button"]').first().click()
    await expect(page).toHaveURL('/stock/NVDA')
  })

  test('stock → overview via sidebar', async ({ page }) => {
    await setWatchlist(page, ['AAPL']); await mockOverview(page); await mockStock(page); await mockSearch(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    await page.locator('.nav-i', { hasText: 'Watchlist' }).click()
    await expect(page).toHaveURL('/overview')
  })

  test('stock → different symbol via topbar search', async ({ page }) => {
    await mockStock(page); await mockOverview(page); await mockSearch(page, [{ symbol: 'TSLA', name: 'Tesla Inc.' }])
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    const input = page.locator('input.search-input')
    await input.click()
    await input.fill('tsla')
    await page.locator('.sr-item', { hasText: 'TSLA' }).click()
    await expect(page).toHaveURL('/stock/TSLA')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
  })

  test('back button returns to previous symbol', async ({ page }) => {
    await mockStock(page); await mockOverview(page); await mockSearch(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    await page.goto('/stock/TSLA')
    await expect(page).toHaveURL('/stock/TSLA')
    await page.goBack()
    await expect(page).toHaveURL('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
  })
})
