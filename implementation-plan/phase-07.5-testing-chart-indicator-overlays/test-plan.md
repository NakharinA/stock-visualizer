# Test Plan — Phase 07.5: Chart Indicator Overlays

## Frontend — Playwright E2E (`chart-overlays.spec.ts`)

Mock `/api/stock/AAPL?period=3mo` to return a fixed response with all indicator arrays populated.

### E2E Tests

| Test | User Flow | Expected Result |
|------|-----------|-----------------|
| Fibonacci price labels appear | Check "Fibonacci" checkbox | DOM contains axis label text "0.5" or "0.618" |
| Fibonacci disabled by default | Load page | No Fibonacci axis labels visible initially |
| S/R price labels appear | Check "Support/Resistance" | Price line labels visible in chart axis |
| FVG lines appear | Check "Fair Value Gaps" | Two price line labels per FVG zone visible |
| Uncheck Fibonacci | Check then uncheck "Fibonacci" | Axis labels disappear |
| EMA 20 on/off | Check then uncheck "EMA 20" | No visible error; chart remains functional |
| Multiple EMA enabled | Check EMA 20 + EMA 50 | Both remain enabled; unchecking one does not affect the other |
| Period switch preserves toggles | Enable EMA 20, switch to 1Y | After load, EMA 20 is still checked; chart shows EMA 20 line |
| Independent toggles | Check Fibonacci, uncheck S/R | Fibonacci remains; S/R lines absent |

---

## Frontend — Playwright Component Tests (`IndicatorToggle.spec.ts`)

| Component | Scenario | Expected Behavior |
|-----------|----------|-------------------|
| IndicatorToggle | Renders 10 checkboxes | Count checkboxes: EMA 20, EMA 50, EMA 100, EMA 200, MACD, RSI, Stoch RSI, Fibonacci, S/R, FVG |
| IndicatorToggle | All unchecked by default | All `checked` attributes are false on mount |
| IndicatorToggle | Check EMA 50 | Emits `update:modelValue` with `{ ...prev, ema50: true }` |
| IndicatorToggle | Uncheck EMA 50 | Emits `update:modelValue` with `{ ...prev, ema50: false }` |
| IndicatorToggle | Group labels visible | Sections labeled "EMA Lines", "Chart Overlays", "Subpanel Indicators" |
| IndicatorToggle | Check Fibonacci | Emits with `fibonacci: true` |
| IndicatorToggle | Check FVG | Emits with `fvg: true` |
| IndicatorToggle | Check MACD | Emits with `macd: true` |
