# Dependencies — Phase 06

## Phase Dependencies
- Requires Phase 05 to be complete (chart page, `IndicatorToggle.vue`, `CandleChart.vue`)
- Requires Phase 03 to be complete (backend returning `macd`, `rsi`, `stoch_rsi` in indicators)
- Specifically needs: `IndicatorToggle.vue` already has MACD/RSI/StochRSI checkboxes (they were rendered but non-functional in Phase 05)

## External Services
- **FastAPI backend** at `http://localhost:8000` — must be running

## Libraries & Packages

No new packages. Lightweight Charts is already installed from Phase 05.

## Notes

The subpanel uses separate Lightweight Charts instances (one per tab) rather than panes within a single chart instance. This gives more layout control and avoids complexity with Lightweight Charts' built-in pane system.

Each oscillator chart uses a **price scale** configured for its range (e.g. 0–100 for RSI/StochRSI, auto for MACD). Set `autoSize: false` and explicit height via CSS.
