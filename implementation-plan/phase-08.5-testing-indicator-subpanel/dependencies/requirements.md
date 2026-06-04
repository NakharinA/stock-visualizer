# Dependencies — Phase 08.5

## Phase Dependencies
- Requires Phase 08 to be fully complete

## Libraries & Packages
No new packages required.

| Package | Purpose |
|---------|---------|
| @playwright/test | E2E and component tests |
| @nuxt/test-utils | Nuxt component mounting |

## Notes on Testing Subpanel Resize
The main chart resize behavior (expanding when subpanel collapses) is observable by comparing the chart container's `clientHeight` before and after toggling. Use `page.evaluate()` to query the DOM height.

## Running Tests
```bash
npx playwright test tests/e2e/indicator-subpanel.spec.ts
npx playwright test tests/components/IndicatorPanel.spec.ts
```
