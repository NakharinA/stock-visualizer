# Stock Trading UI — Blueprint

## Project Overview

A personal stock tracking web app built with **Nuxt 3** + **Nuxt UI** + **Tailwind CSS**. The goal is a TradingView-inspired interface with fewer features — focused on viewing stock charts, indicators, and personal PnL tracking. The user has their own backend and will wire up API calls based on the UI structure.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Nuxt 3 |
| UI Library | Nuxt UI + Tailwind CSS |
| Stock chart | LightweightCharts (TradingView OSS) |
| Dashboard chart | ApexCharts (vue3-apexcharts) |
| State management | Pinia |
| Auth | Email + Google OAuth (mocked UI, backend-ready) |
| Theme | Dark + Light toggle (dark-first) |

---

## Pages

### 1. Login Page (`/login`)

- Centered card layout
- Email + password fields
- "Sign in with Google" button (calls backend OAuth endpoint, no Google SDK needed on frontend)
- Dark/light aware styling
- Redirect to `/dashboard` on success

---

### 2. Dashboard Page (`/dashboard`)

**Layout — top to bottom:**

#### Row 1 — PnL Graph Card (full width)
- Large card spanning full width
- ApexCharts area/line chart showing PnL over the past 1 week (daily data points)
- Title: "Profit & Loss — Last 7 Days"
- Data fetched from backend

#### Row 2 — 4 Stat Cards (equal width, same row)
| Card | Content |
|---|---|
| Stat Card 1 | Focusing stock — symbol + current price |
| Stat Card 2 | Today PnL — amount + % change |
| Stat Card 3 | Blank (reserved) |
| Stat Card 4 | Blank (reserved) |

#### Row 3 — 2 Large Cards (same row, equal width)
| Card | Content |
|---|---|
| Detail Card 1 | Blank (reserved) |
| Detail Card 2 | Table of focusing stock info: Symbol, Last Price, Change, Change % |

---

### 3. Stock Page (`/stock`)

**Layout — left sidebar + main chart area:**

#### Left Panel (collapseable, icon-only when collapsed)
- Default state: **icon-only** (48px wide), showing stock initials badge
- Expanded state: 200px wide, shows full watchlist
- Toggle button lives inside the panel header
- **Watchlist table** — selectable rows, clicking a stock loads its chart
- **Add stock button** (dashed `+` at bottom) — opens stock search modal
- Focused/selected stock highlighted with left blue border accent

#### Stock Search Modal
- Triggered by the `+` Add stock button
- Search input at top (by symbol or company name)
- Results displayed as a **table** (not dropdown) with columns: Symbol, Company Name, Exchange, Sector
- "Add" button per row — adds to watchlist, persists to backend
- Already-added stocks show disabled "Added" state

#### Right Panel — Chart Area
**Toolbar (top bar):**
- Currently selected ticker badge
- Current price + change display
- "Indicators" button (right side) → opens indicator modal

**Indicator Modal:**
- Search input at top
- Two sections:
  - **Overlay** — indicators rendered on the main chart (EMA 20, EMA 50, Bollinger Bands, Volume)
  - **Separate pane** — indicators rendered in the tabbed pane below (RSI, MACD, Stochastic, CCI)
- Toggle on/off by clicking — checkmark shown when active
- Overlay indicators added/removed from main chart series
- Pane indicators add/remove tabs in the indicator pane

**Main Chart:**
- LightweightCharts candlestick chart
- Overlay indicators rendered as additional series on the same chart (e.g. LineSeries for EMA, HistogramSeries for Volume)
- Timeframe selector (1D, 1W, 1M, 3M, 1Y) — fetches data from backend

**Resize Handle:**
- Draggable horizontal divider between main chart and indicator pane
- Drag up = taller indicator pane, drag down = shorter
- Min pane height: 60px, Max: 260px

**Indicator Pane:**
- Tabbed — one LightweightCharts instance per active pane indicator
- Tabs show indicator name + `✕` close button
- Closing a tab also unticks it in the indicator modal
- Empty state shown when no pane indicators are active

---

## Navigation (Left Sidebar — Global)

- Fixed left sidebar, present on Dashboard and Stock pages (not Login)
- **Collapseable** — icon-only when collapsed
- Nav items: Dashboard, Stock
- **Bottom section:** User avatar + name, Logout button
- **Theme toggle** near bottom (sun/moon icon)

---

## State Management (Pinia Stores)

### `useAuthStore`
- `user` — user object (name, email, avatar)
- `isAuthenticated`
- `login()`, `logout()`

### `useWatchlistStore`
- `watchlist` — array of stock objects `{ sym, name, price, change, changePct }`
- `focusedStock` — currently selected stock (persisted to backend)
- `addStock(sym)`, `removeStock(sym)`, `setFocused(sym)`

### `useIndicatorStore`
- `overlayIndicators` — Set of active overlay indicator IDs
- `paneIndicators` — ordered array of active pane indicator IDs
- `activeTab` — currently visible pane tab
- `toggle(id, type)`, `removePane(id)`, `setActiveTab(id)`

### `useChartStore`
- `timeframe` — current selected timeframe
- `candleData` — OHLCV data for current symbol
- `indicatorData` — computed series data per active indicator

---

## Component Structure

```
components/
  layout/
    AppNavbar.vue         # Global left sidebar nav
    NavbarUser.vue        # User + logout section at bottom
    ThemeToggle.vue       # Dark/light toggle button
  stock/
    StockPage.vue         # Main stock page layout wrapper
    WatchlistPanel.vue    # Collapseable left panel
    WatchlistItem.vue     # Single row in watchlist
    StockSearchModal.vue  # Add stock modal with search table
    ChartToolbar.vue      # Ticker badge, price, indicators button
    MainChart.vue         # LightweightCharts candlestick + overlays
    IndicatorPane.vue     # Tabbed pane below main chart
    IndicatorModal.vue    # Indicator add/remove modal
    ResizeHandle.vue      # Draggable divider
  dashboard/
    PnLChart.vue          # ApexCharts PnL area chart
    StatCard.vue          # Generic stat card (reusable)
    FocusStockTable.vue   # Detail Card 2 table
  auth/
    LoginCard.vue         # Email + Google login form
```

---

## Theme

- Dark-first with light/dark toggle
- Toggle stored in Pinia + localStorage
- All colors via Tailwind CSS variables / Nuxt UI theme tokens
- Dark palette reference: background `#0d1117`, surface `#161b22`, border `#30363d`, text primary `#e6edf3`, text muted `#8b949e`, accent blue `#58a6ff`, green `#3fb950`, red `#f85149`

---

## Backend Integration Notes

- All API calls abstracted into composables (`useStockApi`, `useAuthApi`, etc.)
- Composables return typed responses — easy to swap mock data for real endpoints
- Watchlist persisted via backend (GET/POST/DELETE `/watchlist`)
- Focused stock persisted via backend (PUT `/user/focused-stock`)
- Chart data fetched per symbol + timeframe (GET `/chart/:sym?timeframe=1D`)
- PnL data fetched for dashboard (GET `/pnl?range=7d`)

---

## Open Decisions / Not Yet Discussed

- Dashboard Detail Card 1 — content TBD
- Stat Card 3 & 4 — content TBD
- Timeframe selector options — assumed 1D / 1W / 1M / 3M / 1Y (confirm with user)
- Whether the Stock page remembers last viewed symbol across sessions
- Login page — redirect behavior if already authenticated
- Error states (failed chart load, network errors, empty watchlist)
- Mobile responsiveness — not scoped yet, desktop-first for now

---

## Implementation Order (Suggested)

1. Nuxt project setup — install dependencies (LightweightCharts, ApexCharts, Pinia, Nuxt UI)
2. Global layout — AppNavbar with collapse, theme toggle, user section
3. Login page — UI only, mock auth
4. Stock page — WatchlistPanel + StockSearchModal
5. Stock page — MainChart with LightweightCharts (candlestick only first)
6. Stock page — IndicatorModal + overlay indicators on chart
7. Stock page — IndicatorPane with tabs + ResizeHandle
8. Dashboard — StatCards + PnLChart (ApexCharts)
9. Dashboard — FocusStockTable
10. Wire up Pinia stores across all pages
11. Replace mock data with real backend composables
