# Phase 10 — Design Handoff Redesign

## Overview
Apply the **"Ticker"** design handoff (`requirements/Stock-Vitualizer-handoff.zip`,
mocked up in `claude.ai/design`) across the whole app. The backend logic and all
indicator math from Phases 01–09 stay; this phase is a **visual + UX redesign** of
every page plus a genuinely new feature — a fully built **Dashboard** (previously a
blank "Coming soon" page).

The handoff prototype is plain React/HTML/CSS using simulated data. We recreate it
pixel-closely in Nuxt/Vue against the real FastAPI + yfinance backend. The prototype's
custom CSS (`Stock Visualizer.html` `<style>` block) ports directly into
`assets/css/main.css`; page markup is hand-built with those classes for fidelity rather
than fighting Nuxt UI's default theme.

## Design source files (read these)
- `project/Stock Visualizer.html` — design tokens + all CSS
- `project/lib/app.jsx` — shell (sidebar rail, topbar search, index chips, routing, watchlist)
- `project/lib/dashboard-overview.jsx` — Dashboard + Overview pages
- `project/lib/chart-page.jsx` — Chart page (candles, overlays, FVG canvas, oscillator subpanel, right rail)
- `project/lib/ui.jsx` — shared atoms (Icon, Sparkline, Delta) + formatters
- A snapshot is copied into `design/` in this phase folder for reference.

## Decisions (confirmed with user)
1. **Scope:** full redesign of all pages + shell.
2. **Dashboard/Overview data:** extend the `/overview` endpoint to also return
   `name`, `sector`, `volume`, and a `spark` array (~30 recent closes). One yfinance
   history call per symbol already provides all of it; math stays server-side.
3. **"Movers today" universe:** a hardcoded popular large-cap list (frontend config),
   ranked client-side via the existing `/overview` (which accepts arbitrary symbols).

## Deliverables & Acceptance Criteria

### Backend — extend `/overview`
- [ ] `OverviewItem` gains `name: str`, `sector: str`, `volume: float`, `spark: list[float]`
- [ ] `fetch_overview` returns those fields; existing `price`/`diff_value`/`diff_pct` semantics unchanged
- [ ] Robust to partial yfinance failures (best-effort `name`/`sector`, never 500s a whole batch)
- [ ] Existing overview endpoint tests still pass; new fields covered by tests (Phase 10.5)

### Design system
- [ ] IBM Plex Sans + IBM Plex Mono loaded (Google Fonts via `nuxt.config` head)
- [ ] Design tokens (`--bg`, `--panel`, `--accent #ff7a18`, `--up`, `--down`, radii, etc.) defined as CSS vars
- [ ] Prototype CSS ported into `assets/css/main.css`; body uses the dark `--bg`/Plex font

### Shared atoms (new)
- [ ] `utils/format.ts` — `fmtPrice`, `fmtSigned`, `fmtPct`, `fmtCompact`
- [ ] `components/ui/Sparkline.vue` — SVG sparkline w/ gradient fill, up/down color
- [ ] `components/ui/Delta.vue` — delta value/pct pill w/ triangle, up/down
- [ ] `components/ui/AppIcon.vue` — inline SVG icon set (dashboard, chart, table, search, plus, x, star, bolt, chevron…)

### Shell (`layouts/default.vue` + topbar)
- [ ] 78px icon-rail sidebar: "Ticker" brand + bolt mark, nav (Dashboard / Chart / Watchlist) icon+label, active = accent, "sim" footer
- [ ] Topbar: global symbol search (autocomplete → navigate to `/stock/{sym}`) + SPY/QQQ index chips (live from `/overview`)
- [ ] Chart nav item points to last-viewed symbol (`sv.last` in localStorage) or `AAPL`

### Dashboard (`pages/index.vue`) — NEW
- [ ] Greeting hero (time-of-day) + date + "Markets open" status pill
- [ ] 4 index cards (SPY, QQQ, NVDA, AAPL): symbol, delta, price, sparkline; click → chart
- [ ] "Your watchlist" panel: grid of watchlist cards (sym, name, sparkline, price, delta); empty state; "Open overview" link
- [ ] "Movers today" panel: gainers + losers (top 5 each) ranked over the hardcoded universe

### Overview (`pages/overview.vue`)
- [ ] Header (title + "N symbols · saved to this browser") + add-symbol form (validated, dup warning)
- [ ] Quick-add chips (universe symbols not yet watched)
- [ ] Sortable table: Symbol, Name, Last, Chg, Chg %, 30D sparkline, Volume, remove. Click row → chart; remove stays on page
- [ ] Sort carets reflect active column + direction

### Chart page (`pages/stock/[[symbol]].vue` + chart components)
- [ ] Rich header: symbol + star/watchlist toggle, name + sector, last price + delta pill, period segments (YTD/1Y/6M/3M/1M/1W), reset-zoom button
- [ ] OHLC crosshair legend overlay (updates on hover) + EMA legend chips (for enabled EMAs)
- [ ] Right indicator rail (≈232px) with switch toggles grouped **Overlays** / **Oscillators**; toggle state persists (localStorage)
- [ ] FVG rendered as semi-transparent canvas **boxes** (bullish green / bearish red) synced to zoom/resize
- [ ] Fibonacci + Support/Resistance as price lines; EMA overlays on main chart
- [ ] Oscillator subpanel below chart: tabs for **enabled** indicators only, value readouts in the bar; collapses (chart expands) when all oscillators off; zoom synced with main chart

### Behavior parity (must keep working)
- [ ] Zoom-only chart (no horizontal pan); reset-zoom fits content
- [ ] Watchlist localStorage persistence (key `stock-watchlist`)
- [ ] `/stock` with no symbol redirects to last-viewed / `AAPL`
- [ ] Loading skeletons + error states on every page (carried from Phase 09)

## Dependencies
- Phases 01–09 complete (they are).
- No new runtime packages (fonts via CDN; icons hand-rolled SVG). See `dependencies/requirements.md`.

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file |
| tasks.md | Granular, ordered checklist |
| dependencies/requirements.md | Package/asset notes |
| design/ | Snapshot of the handoff source for reference |

## Hand-off to Phase 10.5
The redesign changes the UI contract the current Playwright suite encodes
(checkbox toggles → switches, group/label text, subpanel sizing, default-on
indicators, new Dashboard). Phase 10.5 rewrites the affected e2e/component specs
to assert the new UI while preserving behavioral coverage, and adds Dashboard tests.
</content>
</invoke>
