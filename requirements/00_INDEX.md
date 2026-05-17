# TradingView-Like Stock Chart App — Build Index

## Overview
A TradingView-like web app with candlestick charts, technical indicators, custom formula support, and freehand drawing tools.

## Tech Stack Summary
| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, UV, venv |
| Data | yfinance |
| Indicators | pandas, pandas-ta |
| Custom Formula | pandas eval (sandboxed) |
| Frontend | Nuxt 3, Vue 3 |
| Chart Engine | lightweight-charts v4 (TradingView OSS) |
| State | Pinia |
| Styling | TailwindCSS |
| Deployment | Docker + docker-compose |

## Project Root Layout
```
project-root/
├── backend/
├── frontend/
├── docker-compose.yml
├── docker-compose.dev.yml
└── specs/               ← all these files live here
```

## Build Phases (in order)

| File | Phase | Description |
|------|-------|-------------|
| `01_backend_scaffold.md` | 1 | FastAPI + UV + venv project setup |
| `02_stock_data_api.md` | 2 | yfinance OHLCV endpoints |
| `03_indicator_api.md` | 3 | Preset indicators + custom formula engine |
| `04_frontend_scaffold.md` | 4 | Nuxt 3 project setup + folder structure |
| `05_chart_core.md` | 5 | Candlestick chart with lightweight-charts |
| `06_indicator_ui.md` | 6 | Indicator panel — preset picker + formula editor |
| `07_drawing_tools.md` | 7 | Trendline, FVG box, horizontal line drawing |
| `08_docker_deploy.md` | 8 | Dockerfile + docker-compose for prod & dev |

## Rules for the AI Building Each Phase
- Complete each phase fully before moving to the next
- Do not install packages not listed in each phase
- Follow Nuxt 3 file conventions strictly (pages/, components/, composables/, stores/)
- Never use a database — all state is in-memory or client-side
- All coordinates for drawing tools must be stored in price/time space, NOT pixel space
- Backend always runs on port 8000, frontend on port 3000
