# Dependencies — Phase 09.5

## Phase Dependencies
- Requires Phase 09 to be fully complete (all polish applied)
- All prior feature phases must be complete

## Libraries & Packages
No new packages required.

| Package | Purpose |
|---------|---------|
| @playwright/test | E2E regression test runner |

## Running Tests
```bash
npx playwright test tests/e2e/polish.spec.ts

# Run the full test suite for final sign-off:
npx playwright test
```

## Viewport Testing in Playwright
Use `page.setViewportSize()` for responsive tests:
```ts
await page.setViewportSize({ width: 1280, height: 800 })
await page.setViewportSize({ width: 768, height: 1024 })
```
