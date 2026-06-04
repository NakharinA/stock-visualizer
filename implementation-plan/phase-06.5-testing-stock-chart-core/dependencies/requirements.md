# Dependencies — Phase 06.5

## Phase Dependencies
- Requires Phase 06 to be fully complete

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| @playwright/test | >=1.44 | E2E and component test runner |
| @nuxt/test-utils | >=3.13 | Nuxt-aware Playwright mounting |

## Notes on Testing Canvas (Lightweight Charts)
Playwright cannot directly assert the contents of an HTML5 canvas element. Instead:
- Assert that the chart `<canvas>` element exists in the DOM
- Assert that the container element has non-zero dimensions
- Assert that error states are NOT visible when valid data is loaded
- For deeper chart validation, test API call behavior (assert the network request was made with correct params)

## Running Tests
```bash
npx playwright test tests/e2e/stock-chart.spec.ts
npx playwright test tests/components/SymbolSearch.spec.ts
```
