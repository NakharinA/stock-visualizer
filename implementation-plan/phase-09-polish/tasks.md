# Tasks — Phase 09

## Loading States

- [ ] Create `components/chart/ChartSkeleton.vue`:
  - Dark background rectangle matching chart container dimensions
  - Animated pulse using Tailwind `animate-pulse`
  - Shown via `v-if="loading"` in the stock chart page

- [ ] Stock Chart page: set `loading = true` before `fetchStock`, `loading = false` after (already exists — verify it drives ChartSkeleton visibility)

- [ ] SymbolSearch: add loading spinner inside the dropdown while `searchSymbols` is pending
  - Use `UIcon` with a spinner or Tailwind `animate-spin`
  - Show spinner while `searching = true`, replace with results when done

- [ ] Stock Overview: verify skeleton rows are shown correctly with `loading` prop (implemented in Phase 05, audit and fix any gaps)

## Error States

- [ ] Stock Chart page: wrap `fetchStock` in try/catch; on error, set `error = errorMessage`
  - Show `<UAlert color="red" :title="error">` when `error` is truthy
  - Show "Try again" button that re-calls `fetchStock`
  - Distinguish 404 (symbol not found) from network errors in the message

- [ ] Stock Overview page: wrap `fetchOverview` in try/catch
  - Show `<UAlert>` with error and retry button on failure

- [ ] SymbolSearch: show "No results found" text in dropdown when search returns an empty array

## Dark Theme Audit

- [ ] Visit `/stock/AAPL` and inspect chart instance options — verify background, text, grid colors
- [ ] Visit `/overview` — inspect table, inputs, and buttons for light-mode artifacts
- [ ] Visit `/` (Dashboard) — verify layout background is dark
- [ ] Confirm `nuxt.config.ts` has `colorMode: { preference: 'dark' }` and no `forcedTheme` override
- [ ] Update all chart `createChart()` calls to use CSS variable or a shared `CHART_THEME` constant:
  ```ts
  export const CHART_THEME = {
    layout: { background: { color: '#0f1117' }, textColor: '#9ca3af' },
    grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
  }
  ```
  Import and apply in `CandleChart.vue` and `IndicatorPanel.vue`

## Responsive Layout

- [ ] Test at 1280px: use browser devtools, verify no overflow
- [ ] Test at 768px: verify chart still fills width, IndicatorToggle panel wraps gracefully
- [ ] Stock Chart page: ensure `IndicatorToggle` checkboxes wrap to multiple rows on narrower screens (use `flex-wrap`)
- [ ] Stock Overview page: verify table is horizontally scrollable if columns overflow on narrow screens (`overflow-x-auto` on table wrapper)
- [ ] Confirm sidebar collapses as expected at mobile widths (Nuxt UI Pro default behavior)
