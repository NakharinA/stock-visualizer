# Phase 09 — Polish

## Goals
- Add loading skeleton states on all pages during data fetching
- Add error messages and error boundaries on all pages for API failures
- Ensure dark theme is consistent across all pages, components, and chart instances
- Audit and fix responsive layout on all pages (desktop and tablet minimum)

## Deliverables & Acceptance Criteria

### Loading States
- [ ] Stock Chart page: show a skeleton overlay on the chart canvas while `fetchStock` is in flight
- [ ] Stock Chart page: show a skeleton on the IndicatorPanel subpanel while fetching
- [ ] Stock Overview page: show skeleton rows in the table while `fetchOverview` is in flight (already started in Phase 05 — verify and refine)
- [ ] Symbol search dropdown: show a loading spinner while `searchSymbols` is in flight

### Error States
- [ ] Stock Chart page: show `UAlert` with error message when `fetchStock` fails (symbol not found, network error)
- [ ] Stock Overview page: show `UAlert` when `fetchOverview` fails
- [ ] Symbol search: show "No results found" message if search returns empty list
- [ ] All error states have a retry mechanism (e.g. "Try again" button)

### Dark Theme Consistency
- [ ] All Lightweight Charts instances use the same dark background color as the page (`#0f1117` or the Nuxt UI dark background token)
- [ ] All chart axis label colors, grid line colors, and crosshair colors match the dark theme
- [ ] Nuxt UI components (UTable, UTabs, UInput, UButton, UCheckbox) render correctly in dark mode with no light-mode artifacts
- [ ] `colorMode.preference: 'dark'` is set in `nuxt.config.ts` (verify from Phase 02)

### Responsive Layout
- [ ] Stock Chart page at 1280px wide: all elements fit without horizontal scrollbar
- [ ] Stock Chart page at 768px wide (tablet): chart, toggle panel, and subpanel stack correctly
- [ ] Stock Overview page at 768px wide: table is readable (no column overflow)
- [ ] Sidebar navigation collapses or scrolls on small screens (Nuxt UI Pro handles this)

## Dependencies
- Phases 05, 06, 07, and 08 must all be complete (all features implemented)

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| tasks.md | Granular checklist |
| dependencies/requirements.md | No new packages |
