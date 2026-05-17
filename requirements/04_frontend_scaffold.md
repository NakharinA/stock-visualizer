# Phase 4 — Frontend Scaffold (Nuxt 3)

## Goal
Initialize a Nuxt 3 project with TailwindCSS, Pinia, lightweight-charts, and the correct folder structure. No chart rendering yet — just the skeleton.

## Depends On
Phase 1 must be complete (backend must be running on port 8000).

---

## 1. Initialize Nuxt 3 Project

```bash
cd frontend
npx nuxi@latest init .
# Choose: npm
# Choose: No for Git
```

Then install dependencies:
```bash
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install pinia @pinia/nuxt
npm install lightweight-charts
npm install @vueuse/core
```

---

## 2. `nuxt.config.ts`

```ts
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@pinia/nuxt"],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
    },
  },

  app: {
    head: {
      title: "StockChart",
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
    },
  },
});
```

---

## 3. `.env` (frontend root)

```env
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 4. `assets/css/main.css`

```css
@import "tailwindcss";

:root {
  --color-bg:        #0f1117;
  --color-surface:   #1a1d27;
  --color-border:    #2a2d3a;
  --color-accent:    #2962ff;
  --color-up:        #26a69a;
  --color-down:      #ef5350;
  --color-text:      #d1d4dc;
  --color-muted:     #787b86;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
}
```

Reference it in `nuxt.config.ts`:
```ts
css: ["~/assets/css/main.css"],
```

---

## 5. Folder Structure to Create

```
frontend/
├── assets/
│   └── css/
│       └── main.css
├── components/
│   ├── chart/
│   │   ├── CandlestickChart.vue     ← Phase 5
│   │   └── IndicatorPane.vue        ← Phase 6
│   ├── toolbar/
│   │   ├── TickerSearch.vue         ← Phase 5
│   │   ├── IntervalSelector.vue     ← Phase 5
│   │   └── IndicatorPanel.vue       ← Phase 6
│   ├── indicator/
│   │   ├── PresetPicker.vue         ← Phase 6
│   │   └── FormulaEditor.vue        ← Phase 6
│   └── drawing/
│       ├── DrawingToolbar.vue       ← Phase 7
│       ├── TrendlinePrimitive.ts    ← Phase 7
│       └── FVGBoxPrimitive.ts       ← Phase 7
├── composables/
│   ├── useStockData.ts              ← Phase 5
│   └── useIndicator.ts              ← Phase 6
├── stores/
│   ├── chart.ts                     ← Phase 5
│   ├── indicator.ts                 ← Phase 6
│   └── drawings.ts                  ← Phase 7
├── types/
│   └── index.ts                     ← this phase
├── pages/
│   └── index.vue                    ← this phase (layout shell)
├── app.vue
├── nuxt.config.ts
└── .env
```

Create all `.vue` files as empty shells with `<template><div /></template>` for now.
Create all `.ts` files as empty with a `// TODO` comment.

---

## 6. `types/index.ts`

```ts
export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockResponse {
  ticker: string
  interval: string
  period: string
  candles: Candle[]
}

export interface IndicatorSeries {
  name: string
  time: number[]
  values: (number | null)[]
}

export interface IndicatorResponse {
  type: string
  series: IndicatorSeries[]
}

export interface ActiveIndicator {
  id: string               // unique uuid
  type: string             // e.g. "RSI"
  params: Record<string, number | string>
  formula?: string
  pane: "main" | "sub"     // overlay on price pane vs separate pane
  color: string
  series: IndicatorSeries[]
}

export type DrawingToolType = "none" | "trendline" | "hline" | "fvgbox" | "freehand"

export interface DrawingPoint {
  time: number             // unix timestamp
  price: number
}

export interface Drawing {
  id: string
  tool: DrawingToolType
  points: DrawingPoint[]   // trendline = 2 points, hline = 1, fvgbox = 2 (topLeft, bottomRight)
  color: string
  opacity: number
  lineWidth: number
}
```

---

## 7. `pages/index.vue` — Layout Shell

```vue
<template>
  <div class="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
    <!-- Top toolbar -->
    <div class="flex items-center gap-3 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <span class="text-white font-bold text-lg">📈 StockChart</span>
      <!-- TickerSearch, IntervalSelector, IndicatorPanel go here in Phase 5/6 -->
    </div>

    <!-- Main content area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Drawing toolbar (left sidebar) — Phase 7 -->
      <div class="w-10 bg-[var(--color-surface)] border-r border-[var(--color-border)]" />

      <!-- Chart area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Candlestick chart — Phase 5 -->
        <div class="flex-1 bg-[var(--color-bg)]" />

        <!-- Indicator sub-panes — Phase 6 -->
      </div>
    </div>
  </div>
</template>
```

---

## 8. `app.vue`

```vue
<template>
  <NuxtPage />
</template>
```

---

## How to Run (Dev)
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

## Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] `http://localhost:3000` loads a dark page with a top toolbar
- [ ] No TypeScript errors in `types/index.ts`
- [ ] Pinia is registered and usable
