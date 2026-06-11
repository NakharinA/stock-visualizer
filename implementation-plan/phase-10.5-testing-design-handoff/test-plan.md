# Phase 10.5 — Test Plan

## Selector reference (new UI)
- **Toggle (rail):** `button.tog` with accessible name = label; on-state via class `tog` + `on` and `aria-pressed="true"` on the inner `.tog-sw`. Prefer `getByRole('button', { name }).and(...)` or check `[data-on="true"]`.
- **Period segments:** `button.seg` with name YTD/1Y/6M/3M/1M/1W; active = class `seg active` (accent bg).
- **Oscillator tabs:** `button.osc-tab`; active = class `osc-tab active`. Only enabled indicators render a tab.
- **Overview rows:** `tr[role="button"]`; remove = `button[aria-label="Remove"]` inside the row.
- **Add form:** input placeholder `Add symbol (e.g. NFLX)`; submit button name `Add`; dup warning text `Already in watchlist`.
- **Star/watchlist (chart header):** `button.star-btn`, on-state class `on`.
- **Dashboard:** index cards `button.idx-card`; watchlist cards `button.wl-card`; mover rows `button.mv-row`.

## Per-spec work
1. **backend `test_overview_endpoint.py`** — add field-presence + `spark`/`volume` type checks.
2. **`shell.spec.ts` (new)** — mock `/overview` (index chips) + `/search`; assert nav + search-navigate + chips.
3. **`dashboard.spec.ts` (new)** — mock `/overview`; index cards count = 4 and navigate; watchlist grid count matches localStorage; empty-state text when watchlist empty; gainers/losers ordering from mock pct.
4. **`overview.spec.ts`** — re-verify add/remove/persist/row-click/dup/skeleton(`.h-10.w-full.rounded-lg` or new skeleton hook)/error; add: clicking a column header sorts; quick-add chip adds a symbol.
5. **`IndicatorToggle.spec.ts`** — 10 toggles present; default-on set = {ema20, ema50, sr, fvg, macd}; toggling flips `aria-pressed`/class; groups "Overlays"/"Oscillators" visible; labels incl. "Fair Value Gap", "Support / Resistance".
6. **`chart-overlays.spec.ts`** — toggle each overlay on/off, chart stays functional (canvas visible); independent toggles; period switch preserves state. FVG now draws a canvas box — assert canvas still present (pixel assertions out of scope).
7. **`indicator-subpanel.spec.ts`** — default MACD on → subpanel visible w/ MACD tab active; enabling RSI adds tab; switching tabs; disabling all oscillators collapses subpanel (chart height grows); period persistence; readout values present.
8. **`IndicatorPanel.spec.ts`** — only-enabled tabs render; active tab class; value readouts update.
9. **`stock-chart.spec.ts`** — redirect; canvas; 6 segments via `button.seg`; period switch API; search nav; 404; loading skeleton (`.animate-pulse`).
10. **`polish.spec.ts`** — loading/error/responsive against new layout; dark bg `--bg #101116` (rgb(16,17,22)) on body/app.

## Run
```
cd frontend
npx playwright test            # all e2e + component specs
cd ../backend && python -m pytest
```
Note: `forbidOnly` + single worker per `playwright.config.ts`. Dev server auto-starts.
</content>
