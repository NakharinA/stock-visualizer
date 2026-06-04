# Test Plan — Phase 08.5: Indicator Subpanel

## Frontend — Playwright E2E (`indicator-subpanel.spec.ts`)

Mock `/api/stock/AAPL?period=3mo` to return data with populated `macd`, `rsi`, `stoch_rsi`.

### E2E Tests

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Subpanel hidden on load | Navigate to `/stock/AAPL` | No subpanel div visible; no tab bar |
| Subpanel appears on MACD enable | Check "MACD" in IndicatorToggle | Subpanel div becomes visible; MACD tab is active |
| Subpanel appears on RSI enable | Check "RSI" (MACD was off) | Subpanel visible; RSI tab is active |
| Tab switch | Enable MACD + RSI; click RSI tab | RSI chart container visible; MACD container hidden |
| MACD tab active | Click MACD tab | MACD chart container visible |
| Unchecked tab shows message | Enable only MACD; click RSI tab | "Enable RSI" message visible; no canvas chart |
| Subpanel collapses on last disable | Enable only RSI; uncheck RSI | Subpanel hidden; no tab bar |
| Main chart grows | Compare heights: subpanel visible vs hidden | `chartContainer.clientHeight` is greater when subpanel hidden |
| Period switch preserves tab | Enable MACD + RSI; switch to 1Y; MACD is active | After load, MACD is still active; subpanel still visible |
| All 3 enabled shows all tabs | Enable MACD + RSI + StochRSI | Tab bar shows 3 clickable tabs |

---

## Frontend — Playwright Component Tests (`IndicatorPanel.spec.ts`)

| Component | Scenario | Expected Behavior |
|-----------|----------|-------------------|
| IndicatorPanel | All indicators off | Component not rendered (v-if false) |
| IndicatorPanel | MACD enabled | Component renders; MACD tab exists |
| IndicatorPanel | All 3 enabled | Tab bar shows MACD, RSI, Stoch RSI tabs |
| IndicatorPanel | Click RSI tab | Emits `update:activeTab` with `'rsi'` |
| IndicatorPanel | Click MACD tab | Emits `update:activeTab` with `'macd'` |
| IndicatorPanel | Unchecked tab content | Tab content shows enable-message div, not canvas |
| IndicatorPanel | Active tab content | Active + checked tab renders its chart container |
| IndicatorPanel | Default active tab | When MACD is the only enabled indicator, MACD is the default active tab |
