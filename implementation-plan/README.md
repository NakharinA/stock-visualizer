# Implementation Plan

## Overview
A TradingView-inspired stock visualizer built with Nuxt 3 + Nuxt UI Pro on the frontend and FastAPI + uv on the backend. All stock data is fetched on-demand from yfinance — no database, no cache. The app has three pages: a blank Dashboard, a candlestick Stock Chart page with indicator overlays and a tabbed subpanel, and a Stock Overview table backed by a localStorage watchlist.

## Phases

| Phase | Goal | Key Deliverable |
|-------|------|-----------------|
| Phase 01 | Backend Scaffold | FastAPI project initialized, folder structure, health check endpoint |
| Phase 02 | Frontend Scaffold | Nuxt 3 project initialized, sidebar layout, 3 blank pages |
| Phase 03 | Shared Foundation | Pydantic response models, typed API composable skeleton, dev proxy config |
| Phase 04 | Backend API | All endpoints: /stock/{symbol}, /overview, /search with full indicator logic |
| Phase 04.5 | Testing: Backend API | Unit tests for all indicators, integration tests for all 3 endpoints |
| Phase 05 | Stock Overview Page | Watchlist table connected to /overview with localStorage persistence and row navigation |
| Phase 05.5 | Testing: Stock Overview | Playwright e2e and component tests for the overview page |
| Phase 06 | Stock Chart Core | Candlestick chart, time window tabs, symbol autocomplete search, default symbol |
| Phase 06.5 | Testing: Stock Chart Core | Playwright e2e and component tests for chart core functionality |
| Phase 07 | Chart Indicator Overlays | EMA lines, Fibonacci levels, S/R lines, FVG boxes, indicator toggle panel |
| Phase 07.5 | Testing: Chart Overlays | Tests for overlay rendering and toggle behavior |
| Phase 08 | Indicator Subpanel | MACD/RSI/StochRSI tabbed subpanel with collapse/expand behavior |
| Phase 08.5 | Testing: Indicator Subpanel | Tests for tab switching, chart resize, and subpanel collapse |
| Phase 09 | Polish | Loading skeletons, error states, dark theme consistency, responsive layout |
| Phase 09.5 | Testing: Polish | Final regression pass across all pages |

## How Phases Chain Together

**Phases 01–03** are purely scaffold. Phase 01 initializes the FastAPI backend project. Phase 02 initializes the Nuxt frontend shell. Phase 03 wires them together via typed composables and shared configuration — no real API calls or feature logic yet.

**Phase 04** builds all backend logic: yfinance data fetching, all indicator calculations (EMA, MACD, RSI, StochRSI, Fibonacci, S/R, FVG), and all three API routes including the autocomplete search. This phase must be fully complete before any frontend page can display real data.

**Phase 05** implements the Stock Overview page. It has a simple API dependency (only /overview), no chart library, and self-contained state (localStorage). It is intentionally built before the chart page to establish the frontend data-fetching and table patterns.

**Phase 06** integrates Lightweight Charts into the Stock Chart page. This is the most technically complex frontend phase: configuring zoom-only behavior, rendering candlesticks from OHLCV data, wiring autocomplete search, and handling the default symbol redirect. It depends on Phase 04 (for real data) and Phase 03 (for the API composable).

**Phase 07** adds overlay layers on top of the working Phase 06 chart: EMA lines, Fibonacci levels, Support/Resistance horizontal lines, and FVG semi-transparent boxes. The `IndicatorToggle.vue` panel controls visibility of all overlays and subpanel indicators.

**Phase 08** adds the tabbed indicator subpanel below the main chart for MACD, RSI, and StochRSI. Includes the collapse behavior: when all subpanel indicators are toggled off, the subpanel hides and the main chart expands to full height.

**Phase 09** applies final polish: skeleton loaders, error boundaries, consistent dark theming across all pages, and a responsive layout audit.
