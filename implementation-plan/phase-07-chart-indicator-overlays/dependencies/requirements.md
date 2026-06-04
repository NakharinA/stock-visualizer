# Dependencies — Phase 07

## Phase Dependencies
- Requires Phase 06 to be complete (CandleChart.vue with working chart instance, stock page fetching data)
- Specifically needs: chart instance accessible for adding series and price lines

## External Services
- None (indicator data comes from the already-implemented `/stock` API response)

## Libraries & Packages
No new packages required. All packages from Phase 06 cover this phase.

| Package | Already installed | Purpose in this phase |
|---------|------------------|----------------------|
| lightweight-charts | Yes (Phase 06) | `addLineSeries()`, `createPriceLine()`, `removePriceLine()` |

## Notes
- Do NOT add `scipy` or any new Python packages to the backend — FVG, S/R, and Fibonacci are already computed in Phase 04
- No new API endpoints needed — all indicator data is already in the `/stock/{symbol}` response
- If rectangle FVG overlays are desired in a future phase, evaluate `lightweight-charts-plugin-primitives` at that time
