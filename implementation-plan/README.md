# Implementation Plan

## Overview

A TradingView-inspired stock visualizer with a Nuxt 3 frontend and a FastAPI + uv backend. All stock data is fetched on-demand from yfinance — no database, no cache. The app has three pages: a blank Dashboard, a candlestick Stock Chart with overlaid indicators and oscillator subpanels, and a Stock Overview table backed by a localStorage watchlist.

## Phases

| Phase | Goal | Key Deliverable |
|-------|------|-----------------|
| Phase 01 | Frontend scaffold | Nuxt 3 + Nuxt UI Pro app runs locally; all three pages stubbed |
| Phase 02 | Backend scaffold | FastAPI server starts; `/health` returns 200 |
| Phase 03 | Backend API & data | All endpoints return correct JSON; yfinance + indicators wired |
| Phase 04 | Stock overview page | Table loads prices; watchlist persists in localStorage; row click navigates |
| Phase 05 | Stock chart — core | Candlestick chart renders; zoom works; EMA overlays toggle; symbol autocomplete works |
| Phase 06 | Stock chart — subpanel | MACD / RSI / StochRSI tabs render; subpanel collapses when all off |
| Phase 07 | Stock chart — advanced overlays | Fibonacci, Support/Resistance, FVG boxes toggle on/off |
| Phase 08 | Polish | Loading states, error handling, dark theme consistency, responsive layout |

## How Phases Chain Together

**Phases 01–02** build the two apps in isolation — each can be run and verified independently before any cross-service wiring.

**Phase 03** completes all backend endpoints. By the time the frontend starts consuming real data (Phase 04), the full API contract is already stable and testable with curl.

**Phase 04** (Stock Overview) is the first integration point: it connects the frontend composable to the real `/overview` endpoint, proving the full request path before tackling the more complex chart page.

**Phases 05–07** build the Stock Chart incrementally: core rendering first (Phase 05), then oscillator subpanels (Phase 06), then the most complex overlays (Phase 07). Each phase leaves the chart in a working, demo-able state.

**Phase 08** is a horizontal polish pass across the entire app — no new features, only UX quality.
