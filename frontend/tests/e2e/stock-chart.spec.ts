import { test, expect, type Page } from '@playwright/test'

type Bar = { time: string; open: number; high: number; low: number; close: number; volume: number }

function makeBars(n = 30): Bar[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date('2024-01-02')
    d.setDate(d.getDate() + i)
    return { time: d.toISOString().slice(0, 10), open: 180, high: 185, low: 175, close: 182, volume: 1e6 }
  })
}

function stockResponse(symbol: string, period = '3mo') {
  return {
    symbol, period,
    ohlcv: makeBars(30),
    indicators: {
      ema20: [], ema50: [], ema100: [], ema200: [],
      macd: { macd: [], signal: [], histogram: [] },
      rsi: [], stoch_rsi: { k: [], d: [] },
      fibonacci: { high: 0, low: 0, levels: {} },
      support_resistance: [], fvg: [],
    },
  }
}

const SEARCH_RESULTS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NVDX', name: 'T-Rex 2X Long NVIDIA Daily' },
]

async function mockApis(page: Page, { delay = 0, symbol404 = false } = {}) {
  await page.route('**/api/stock/**', async (route) => {
    if (symbol404) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"Symbol not found"}' })
      return
    }
    if (delay > 0) await new Promise(r => setTimeout(r, delay))
    const url = new URL(route.request().url())
    const parts = url.pathname.split('/')
    const sym = parts[parts.length - 1] ?? 'AAPL'
    const period = url.searchParams.get('period') ?? '3mo'
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
  })
  await page.route('**/api/search**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(SEARCH_RESULTS) })
  })
}

test.describe('Stock Chart page', () => {
  test('default redirect: /stock → /stock/AAPL', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock')
    await expect(page).toHaveURL(/\/stock\/AAPL/, { timeout: 5000 })
  })

  test('valid symbol: canvas element is present', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
  })

  test('chart container has non-zero dimensions', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    const dims = await page.locator('canvas').first().evaluate(el => ({
      w: el.clientWidth,
      h: el.clientHeight,
    }))
    expect(dims.w).toBeGreaterThan(0)
    expect(dims.h).toBeGreaterThan(0)
  })

  test('all 6 time tabs are present', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    for (const label of ['YTD', '1Y', '6M', '3M', '1M', '1W']) {
      await expect(page.getByRole('button', { name: label })).toBeVisible()
    }
  })

  test('default tab: 3M is active (clicking it again makes no new API call)', async ({ page }) => {
    const apiCalls: string[] = []
    await page.route('**/api/stock/**', async (route) => {
      apiCalls.push(route.request().url())
      const url = new URL(route.request().url())
      const parts = url.pathname.split('/')
      const sym = parts[parts.length - 1] ?? 'AAPL'
      const period = url.searchParams.get('period') ?? '3mo'
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
    })
    await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))

    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
    const countAfterLoad = apiCalls.length

    await page.getByRole('button', { name: '3M' }).click()
    await page.waitForTimeout(200)
    // No new call since period didn't change
    expect(apiCalls.length).toBe(countAfterLoad)
  })

  test('period switch: clicking 1Y calls API with period=1y', async ({ page }) => {
    const apiCalls: string[] = []
    await page.route('**/api/stock/**', async (route) => {
      apiCalls.push(route.request().url())
      const url = new URL(route.request().url())
      const parts = url.pathname.split('/')
      const sym = parts[parts.length - 1] ?? 'AAPL'
      const period = url.searchParams.get('period') ?? '3mo'
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse(sym, period)) })
    })
    await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))

    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })

    await page.getByRole('button', { name: '1Y' }).click()
    await page.waitForTimeout(500)

    expect(apiCalls.some(u => u.includes('period=1y'))).toBe(true)
  })

  test('tab becomes active: 6M tab gets active background after click', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })

    const btn3M = page.getByRole('button', { name: '3M' })
    const btn6M = page.getByRole('button', { name: '6M' })

    const bg3MBefore = await btn3M.evaluate(el => getComputedStyle(el).backgroundColor)
    await btn6M.click()
    await page.waitForTimeout(300)

    const bg6MAfter = await btn6M.evaluate(el => getComputedStyle(el).backgroundColor)
    const bg3MAfter = await btn3M.evaluate(el => getComputedStyle(el).backgroundColor)

    // 6M should now have a solid background (active); 3M should be transparent (ghost)
    expect(bg6MAfter).not.toBe('rgba(0, 0, 0, 0)')
    expect(bg3MAfter).toBe('rgba(0, 0, 0, 0)')
  })

  test('search: typing shows dropdown with results', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    await page.waitForTimeout(1000)

    const input = page.locator('input').first()
    await input.click()
    await input.fill('nvid')
    await page.waitForTimeout(500)

    await expect(page.getByText('NVDA')).toBeVisible()
    await expect(page.getByText('NVIDIA Corporation')).toBeVisible()
  })

  test('search navigation: selecting result navigates to /stock/NVDA', async ({ page }) => {
    await mockApis(page)
    await page.goto('/stock/AAPL')
    await page.waitForTimeout(1000)

    const input = page.locator('input').first()
    await input.click()
    await input.fill('nvid')
    await page.waitForTimeout(500)

    await page.locator('button').filter({ hasText: 'NVDA' }).first().click()
    await expect(page).toHaveURL('/stock/NVDA', { timeout: 3000 })
  })

  test('invalid symbol: shows error message, no canvas', async ({ page }) => {
    await mockApis(page, { symbol404: true })
    await page.goto('/stock/XXXXINVALID')
    await page.waitForTimeout(2000)

    await expect(page.getByText(/XXXXINVALID|not found/i)).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
  })

  test('loading state: spinner visible while fetch is pending', async ({ page }) => {
    // Create the Promise before registering the route so resolveRoute is always a function.
    // The spinner appears when loading=true (sync), before the HTTP request fires (async).
    let resolveRoute!: () => void
    const pending = new Promise<void>(r => { resolveRoute = r })

    await page.route('**/api/stock/**', async (route) => {
      await pending
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(stockResponse('AAPL')) })
    })
    await page.route('**/api/search**', route => route.fulfill({ contentType: 'application/json', body: '[]' }))

    await page.goto('/stock/AAPL')
    await expect(page.locator('.animate-spin')).toBeVisible({ timeout: 5000 })
    resolveRoute()
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 5000 })
  })
})
