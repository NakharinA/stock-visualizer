# Dependencies — Phase 01

## Phase Dependencies
- No prior phases required — this phase starts from scratch

## External Services
- None — no API calls in this phase

## Libraries & Packages

| Package | Version | Purpose |
|---------|---------|---------|
| nuxt | ^3.x | Framework |
| @nuxt/ui-pro | latest | Dashboard layout, dark mode, table, tabs, toast |
| @nuxtjs/color-mode | (via UI Pro) | Dark mode support |
| typescript | ^5.x | Type safety |

## Environment & Setup

- `NUXT_UI_PRO_LICENSE` — Nuxt UI Pro license key (required at build time)
- Initialize with: `npx nuxi@latest init frontend` then add UI Pro per its docs
- Run dev server: `cd frontend && npm run dev`
- Dev server binds to `localhost:3000` by default
