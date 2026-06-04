# Dependencies — Phase 02

## Phase Dependencies
- None. Phase 01 and Phase 02 can be built in parallel.

## External Services
- Nuxt UI Pro license: required to install `@nuxt/ui-pro`. Set `NUXT_UI_PRO_LICENSE` or `NPM_TOKEN` in `.env`.

## Libraries & Packages
| Package | Version | Purpose |
|---------|---------|---------|
| nuxt | ^3.12 | Full-stack Vue framework |
| @nuxt/ui-pro | ^1.x | Dashboard UI components: layout, sidebar, table, tabs, dark mode |
| @nuxtjs/color-mode | ^3.x | Dark/light mode support (included via Nuxt UI Pro) |

## Environment & Setup
- Node.js 20+ required
- Initialize: `npx nuxi@latest init frontend --template ui-pro`
- Or manually: `npx nuxi init frontend && cd frontend && npm install @nuxt/ui-pro`
- Set dark mode default in `nuxt.config.ts`:
  ```ts
  colorMode: { preference: 'dark' }
  ```
- Dev server: `npm run dev` — runs on `http://localhost:3000`

## Routing Notes
- Use `frontend/pages/stock/[[symbol]].vue` (double bracket = optional param) so both `/stock` and `/stock/AAPL` resolve to the same page component
- The `default.vue` layout wraps all pages automatically when set as the default layout
