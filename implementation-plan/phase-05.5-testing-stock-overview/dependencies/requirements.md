# Dependencies — Phase 05.5

## Phase Dependencies
- Requires Phase 05 to be fully complete (all components and page logic implemented)

## External Services
- For e2e tests: backend must be running (or use Playwright `page.route()` to mock API responses)
- Recommendation: mock the `/api/overview` route in Playwright to avoid flaky tests from live yfinance data

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| @playwright/test | >=1.44 | E2E and component test runner |
| @nuxt/test-utils | >=3.13 | Nuxt-aware Playwright setup and component mounting |

Install: `npm install -D @playwright/test @nuxt/test-utils`

## Running Tests
```bash
# E2E tests
npx playwright test tests/e2e/overview.spec.ts

# Component tests
npx playwright test tests/components/StockTable.spec.ts
```
