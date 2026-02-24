# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

No test runner is configured; tests exist under `tests/` but lack a test script.

## Architecture

**Stack**: React 19 + TypeScript + Vite, Zustand (state), React Router v7, Supabase (auth + DB), Tailwind CSS v4, Recharts

**Path alias**: `@/*` → `src/*`

### Multi-Workspace Architecture

The app has three operating modes, controlled by Zustand store (`useAppStore`):

- **Personal**: Real user data persisted in Supabase
- **Example**: Read-only demo scenarios (职场新人/中产家庭/高净值企业家)
- **Sandbox**: Local "what-if" simulations persisted in localStorage

`getCurrentData()` in the store is the central getter — it returns the correct data slice based on the active mode. All pages/components should use this rather than reading mode-specific slices directly.

### State Management (`src/store/`)

Zustand store with Immer + Persist middleware. Key patterns:
- `personalData` / `sandboxData` / `exampleDataCache` — per-mode data slices
- Auth state changes trigger Supabase data fetching and store population
- Sandbox writes go to localStorage; personal writes go to Supabase via service layer

### Data Flow

1. `App.tsx` sets up Supabase auth listener → populates store on login
2. Pages read from `getCurrentData()` and computed getters (category totals, asset calculations)
3. Mutations call store actions → service layer (`src/services/supabaseService.ts`) for personal mode, or direct store updates for sandbox mode

### Core Financial Logic (`src/algorithms/`)

- `insuranceCalculator.ts` — premium, cash value, coverage calculations
- `insuranceDispatch.ts` — triple-dispatch: insurance affects budget, net worth, and risk leverage simultaneously
- `recommendAllocation.ts` — 25-15-50-10 wealth allocation framework
- `spendingAnalytics.ts` — MA-3 (3-month moving average) spending trends

### Routing (`src/App.tsx`)

Pre-auth: `/` (Welcome), `/login`, `/onboarding`
Main app: `/dashboard`, `/spending`, `/assets`, `/settings`
Pages are lazy-loaded with Suspense.

### Component Organization (`src/components/`)

Grouped by feature: `charts/`, `dashboard/`, `insurance/`, `layout/`, `profile/`, `spending/`, `wealth/`, `workspace/`, `ui/` (animated effects), `common/`

### Types (`src/types/`)

Key types: `ProfileData` (aggregates all user data), `WorkspaceMode`, `InsurancePolicy` (with cash value + coverage), `UserProfile` (demographics, risk tolerance, goals), `SpendingRecord`, `Account`

### UI

The app is entirely in Simplified Chinese. Display strings/constants live in `src/utils/`. Tailwind CSS v4 (PostCSS-based, not config-file-based).
