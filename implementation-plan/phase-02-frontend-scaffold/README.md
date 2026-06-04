# Phase 02 — Frontend Scaffold

## Goals
- Initialize the Nuxt 3 project with Nuxt UI Pro
- Set up a persistent sidebar layout with navigation links to all three pages
- Scaffold all three pages with blank content placeholders
- Establish dark mode as the default theme

## Deliverables & Acceptance Criteria
- [ ] `frontend/` directory initialized as a Nuxt 3 project with `@nuxt/ui-pro`
- [ ] `frontend/nuxt.config.ts` has `@nuxt/ui-pro` in modules and `colorMode.preference: 'dark'`
- [ ] `frontend/layouts/default.vue` renders a sidebar with navigation items: Dashboard (`/`), Stock (`/stock`), Overview (`/overview`)
- [ ] `frontend/pages/index.vue` renders a blank page with "Dashboard" heading
- [ ] `frontend/pages/overview.vue` renders a blank page with "Overview" heading
- [ ] `frontend/pages/stock/[[symbol]].vue` renders a blank page with "Stock Chart" heading
- [ ] `npx nuxi dev` starts without errors on `http://localhost:3000`
- [ ] Sidebar navigation links are all functional (no 404s)

## Dependencies
- No prior phase required (can be built in parallel with Phase 01)
- Requires Node.js 20+ installed on the host
- Requires a valid Nuxt UI Pro license key or access token in `.env`

## Files in This Phase
| File | Purpose |
|------|---------|
| README.md | This file — goals, deliverables, dependencies |
| dependencies/requirements.md | Libraries and setup instructions |
