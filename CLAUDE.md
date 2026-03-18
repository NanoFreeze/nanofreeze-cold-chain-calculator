# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NanoFreeze internal portal ("NF Portal Interno") — a React SPA for managing clients, points of sale, and IoT devices for energy efficiency monitoring. Built with React 19 + Vite, authenticated via Auth0, consuming multiple internal REST APIs.

## Commands

- `npm run dev` — start dev server on http://localhost:3000 (auto-opens browser)
- `npm run build` — production build
- `npm run lint` — ESLint check
- `npm run preview` — preview production build

No test framework is configured.

## Architecture

**Entry flow:** `src/main.jsx` → `src/Pages/App/index.jsx` (wraps in `AuthProvider`) → `src/Routes/Routes.tsx` (BrowserRouter with `/auth/*` public routes and `/*` protected routes).

**Authentication:** Auth0-based. `src/Contexts/AuthContext/AuthContext.tsx` manages token, user, and refresh token via cookies (keys: `FAIAccessToken`, `FAIRefreshToken`, `FAIUser`). The `useAuth()` hook provides `token`, `login`, `logout`, `renewToken`, `isAuthenticated`. All API hooks depend on this token.

**Data fetching hooks (key pattern):** The codebase uses custom hooks (not React Query/SWR) that follow a consistent pattern — accept auth token from `useAuth()`, manage `{ data, loading, error, reload }` state, and auto-logout on 401/403:
- `useTable(tableName, queryOptions, mode)` — generic table API consumer (`Environments.tables`). Modes: `"rows"`, `"count"`, `"query"`, `"queryCount"`.
- `useAppCreator(resource, options)` — App Creator API consumer (`Environments.appCreator`). Resources: `apps`, `modules`, `elements`, `deploys`.
- `useDynamicForm({ formId })` — fetches form definitions from the toolbox API.
- Domain-specific hooks in `src/Pages/Clients/Hooks/` (e.g., `useClientData`, `useDeviceData`, `usePointData`) wrap `useTable` for specific entities.

**Environment config:** `src/Environments/Environments.ts` reads all `VITE_*` env vars. Key services: `tables`, `appCreator`, `toolbox`, `things`, `archives`, `analitycs`, `paper`, `support`, `public`, `templates`. Auth0 config under `Environments.auth0`. Firebase config under `Environments.firebaseConfig`.

**Routing (protected):** Layout with collapsible sidebar → nested routes: `/clients`, `/clients/:id_client`, `/clients/:id_client/sale-points/:id_point_of_sale`, `/clients/:id_client/sale-points/:id_point_of_sale/devices/:id_device`, `/reports`, `/alerts`, `/settings`.

**UI stack:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin), MUI components, Heroicons, Lucide icons, Recharts for charts, Leaflet for maps.

## Code Conventions

- Mixed JS/TS codebase: pages and components are `.jsx`, contexts/routes/services are `.tsx`/`.ts`.
- Path alias: `@/` maps to `src/` (configured in `vite.config.js`).
- Components use `index.jsx` barrel pattern inside named folders (e.g., `src/Components/Card/index.jsx`).
- PascalCase directories for source code (`Components/`, `Pages/`, `Hooks/`, `Contexts/`).
- ESLint: unused vars error with `varsIgnorePattern: '^[A-Z_]'` (uppercase or underscore-prefixed vars are allowed).
- ESLint only configured for `.js`/`.jsx` files — TypeScript files are not linted.
- i18n via `react-i18next` / `i18next-browser-languagedetector`.
