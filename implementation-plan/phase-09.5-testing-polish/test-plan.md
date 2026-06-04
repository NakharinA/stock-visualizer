# Test Plan — Phase 09.5: Polish

## Frontend — Playwright E2E (`polish.spec.ts`)

### Loading States

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Chart skeleton visible | Navigate to `/stock/AAPL`, intercept and delay API 500ms | Skeleton div visible before response; disappears after |
| Overview skeleton | Navigate to `/overview`, delay API 500ms | Skeleton rows visible during load |
| Search loading | Type in search bar, delay API 500ms | Spinner visible in dropdown |

---

### Error States

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Chart 404 shows alert | Mock `/api/stock/XXXXXX` to return 404 | `UAlert` visible with error message; no chart canvas |
| Chart 500 shows alert | Mock any stock endpoint to return 500 | `UAlert` with generic error message |
| Chart retry button works | See error alert; click retry | New API call is made; if mock now succeeds, chart renders |
| Overview error shows alert | Mock `/api/overview` to return 500 | `UAlert` with error message visible |
| Search empty shows message | Mock `/api/search?q=zzzzz` to return `[]` | Dropdown shows "No results found" text |

---

### Dark Theme

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| No white background on chart page | Navigate to `/stock/AAPL` | Page background color is dark (not white/light) |
| No white background on overview | Navigate to `/overview` | Page background color is dark |
| No white background on dashboard | Navigate to `/` | Page background color is dark |
| Chart canvas background | Inspect canvas on `/stock/AAPL` | Canvas element has dark background (not transparent white) |

---

### Responsive Layout

| Test | Viewport | User Flow | Expected Result |
|------|----------|-----------|-----------------|
| Chart page 1280px | 1280×800 | Navigate to `/stock/AAPL` | `document.documentElement.scrollWidth <= window.innerWidth` |
| Chart page 768px | 768×1024 | Navigate to `/stock/AAPL` | Page loads; no element overflows viewport width |
| Overview table 768px | 768×1024 | Navigate to `/overview` | Table container has `overflow-x-auto` or is fully visible |

---

### Navigation Regression

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Dashboard → Overview | Click Overview in sidebar | Navigates to `/overview`; no full page reload |
| Overview → Stock | Click row for AAPL | Navigates to `/stock/AAPL` |
| Stock → Overview | Click Overview in sidebar | Navigates to `/overview` |
| Stock → Stock different symbol | Type TSLA in search, select | Navigates to `/stock/TSLA`; chart updates |
| Back button | Navigate to `/stock/AAPL`, then `/stock/TSLA`, press back | Returns to `/stock/AAPL` and loads AAPL chart |
