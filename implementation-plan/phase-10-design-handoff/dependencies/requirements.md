# Phase 10 — Dependencies

## Runtime packages
**None.** The redesign reuses the existing stack:
- Charts: `lightweight-charts` (already installed) — FVG boxes drawn on a plain `<canvas>` overlay via `timeToCoordinate` / `priceToCoordinate`.
- UI: hand-built markup + ported CSS; existing `@nuxt/ui` stays for skeleton/alert helpers.

## Assets
- **Fonts:** IBM Plex Sans + IBM Plex Mono loaded from Google Fonts CDN through
  `nuxt.config.ts` `app.head.link` (no `@nuxt/fonts` module needed). Mirrors the
  prototype's `<link>` tags.
- **Icons:** hand-rolled inline SVG in `components/ui/AppIcon.vue` (ported `PATHS`
  from `ui.jsx`); no icon package added.

## Backend
- No new Python packages. `fetch_overview` uses already-installed `yfinance` /
  `pandas`. Note: reading `.info` for `name`/`sector` adds latency per symbol and can
  fail intermittently — it is wrapped in try/except and falls back to the symbol /
  empty string so a batch never fails wholesale.
</content>
