# Dependencies — Phase 07.5

## Phase Dependencies
- Requires Phase 07 to be fully complete

## Libraries & Packages
Same as Phase 06.5 — no new packages needed.

| Package | Purpose |
|---------|---------|
| @playwright/test | E2E and component tests |
| @nuxt/test-utils | Nuxt component mounting |

## Notes on Testing Chart Overlays
Lightweight Charts renders everything to a canvas. Direct canvas pixel inspection is impractical in Playwright. Instead:
- For E2E overlay tests, verify the behavior indirectly:
  - Assert that a price-line axis label appears in the DOM (Lightweight Charts renders axis labels as DOM elements, not on canvas)
  - Assert that the chart legend or tooltip shows indicator values on hover
- For EMA lines: check that the chart data was set by intercepting the component's method calls (if using a spy), or verify the chart doesn't show an error
- Focus E2E tests on the toggle interaction and data-fetch behavior rather than pixel-level chart rendering
