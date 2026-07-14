# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend for **bread-machine.dev**, a site that helps beginners convert dry-yeast bread recipes to sourdough (and back), scale recipes by baker's percentage, and manage bake-day scheduling. React 18 + TypeScript SPA built with Vite.

This repo is **frontend only**. The API lives in a separate sibling repo at `/home/bash/Dev/breadmachine` (Go, `net/http`, Firestore). Never assume backend code exists here — check the other repo for handler/contract questions.

## Commands

```bash
npm run dev         # Vite dev server (proxies /api -> VITE_API_URL, default localhost:8080)
npm run build        # tsc && vite build
npm run typecheck     # tsc --noEmit
npm run lint          # eslint, --max-warnings 0 (zero tolerance, not just style nits)
npm test              # vitest in watch mode
npx vitest run                              # run full suite once (CI-style)
npx vitest run path/to/file.test.ts         # run a single test file
npx vitest run -t "test name"               # run tests matching a name
```

Tests are colocated with source (`Foo.test.ts` next to `Foo.ts`). Vitest is configured with `globals: true` and `environment: jsdom` (see `vite.config.ts`), so `describe`/`it`/`expect` need no import, and DOM APIs are available without extra setup. Setup file: `src/test/setup.ts`.

`tsconfig.json` has `noUnusedLocals`/`noUnusedParameters` on — leftover unused vars/imports fail `typecheck`, not just lint.

## Architecture

### Data flow
Everything goes through a REST API proxied at `/api/*`. `firebase.ts` only calls `getAuth()` — there is **no Firestore client SDK usage**; the frontend never touches Firestore directly. All reads/writes go through the Go backend, which itself talks to Firestore.

- Reads (`UseFetchRecipes.ts`) always hit the relative path `/api/recipes` — no base-URL override.
- Writes (`UseCreateRecipe.ts`, `useParseRecipe.ts`) attach a Firebase ID token as a `Bearer` header and optionally prefix the URL with `VITE_API_BASE` (a *different* env var from `VITE_API_URL`, which only controls the Vite dev-server proxy target). If a "recipe posts but nothing shows up" bug appears, check whether `VITE_API_BASE` and the dev proxy are pointed at the same backend.

**API contract** (backend: `breadmachine`):

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/recipes` | none | list all, returns `Recipe[]` |
| POST | `/api/recipes` | Bearer token | body: `RecipeRequest`-shaped JSON → returns created `Recipe` |
| POST | `/api/recipes/parse` | Bearer token | body: `{text: string}` → returns `RecipeDTO` |
| GET | `/api/recipes/{id}` | none | **known gap — broken on the backend.** Not currently called by the frontend (recipe detail views read from the already-fetched `RecipeContext` list instead of fetching by id). |
| DELETE | `/api/recipes/{id}` | none | **known gap — broken on the backend.** No delete UI exists yet. |

Building single-recipe fetch, delete, or share-by-link needs the backend fixed first — don't build the frontend half assuming these already work.

### Auth
`AuthContext` wraps Firebase's `onAuthStateChanged`; `user` is `undefined` (loading) → `null` (logged out) → `User` (logged in). Endpoints that mutate data require the Firebase ID token; `GET /api/recipes` does not.

### Domain model (`types/models.ts`, `types/dto.ts`)
A `Recipe` has `doughIngredients` and `otherIngredients`, each an `Ingredient` carrying `quantity`, `unit`, `grams`, `bakerPercentage`, and `densityGPerMl`. Two parallel type sets exist on purpose:
- `models.ts` — the shape used once a recipe is stored/hydrated (`Ingredient`, `Recipe`).
- `dto.ts` — the shape used while parsing/creating a recipe from freeform text (`IngredientDTO`/`RecipeDTO` include `rawLine`/`parseOK`/`confidence` fields the parser backend returns; `IngredientDraft`/`RecipeRequest` are what gets POSTed).

`useFetchRecipes` normalizes documents written before a schema migration (`raw.ingredients` → `doughIngredients`) — if you see `ingredients` referenced anywhere, that's legacy-document shape, not a current field.

### Recipe scaling and yeast conversion
Baker's-percentage scaling (`Utility/scaleRecipe.ts`) and dry-yeast ↔ sourdough conversion (`Hooks/useConvertYeast.ts`) are the two pieces of real domain logic in the app. Both depend on which ingredients are "flour", "water", "yeast", or "starter" — determined by simple substring matching in `Utility/ingredientMatchers.ts` (e.g. any name containing "flour"). This is a deliberate simplicity tradeoff, not an oversight; it's fragile to unusual ingredient names, so if a conversion bug shows up, check whether the ingredient name just doesn't match the expected substring before assuming the math is wrong.

### Unit display formatting
`Utility/formatIngredientDisplay.ts` converts stored grams/ml into the user-facing unit (g / cups / tbsp / tsp), using thresholds in `Utility/constants.ts` (`CONVERSION_THRESHOLD = 60`: below that, prefer tbsp/tsp over fractional cups) and fraction-rounding helpers in `Utility/helperFunctions.ts` (`toFraction`, `tbspToFraction`). Any change to displayed quantities should go through this pipeline rather than formatting numbers ad hoc in components.

### State management
No Redux/Zustand — plain React Context:
- `RecipeContext` (in `App.tsx`) — the fetched recipe list, read by components that need the full set.
- `AuthContext` — current Firebase user.
- `DrawerContext` — mobile side-drawer open state *and* the active main-tab id (`activeTab`) and selected recipe id. Tab state lives here (not in `Tab`'s own state) so the mobile drawer can drive tab switching from outside the tab bar.

### Routing
`react-router-dom` with routes for `/` (landing), `/tab` (the main app — recipe explorer, scaler, dough-temp calculator, scheduler, add/parse recipe, gated by tab id inside `Tab`), `/learn` + `/learning/step/:step` (onboarding), `/about-me`. Auth-gated tools (scheduler, add recipe) are conditionally rendered based on `useAuth()`, not route-guarded.

## Recurring patterns

- **Hook return shape**: data-fetching/action hooks return a plain object of `{ ...state, loading, error, ...actionFns }` — never a class, never a reducer. `error` is always `string | null`, set in a `catch`, cleared in a `finally`-adjacent `setLoading(false)`. Follow this shape for new hooks rather than introducing `useReducer` or a different error type.
- **Auth token retrieval**: authenticated calls repeat the same inline snippet — `const idToken = await auth.currentUser?.getIdToken(); if (!idToken) throw new Error(...)` (see `UseCreateRecipe.ts`, `useParseRecipe.ts`). There's no shared helper for this yet; match the inline pattern rather than assuming one exists to import.
- **Styling**: one plain `.css` file per component, imported directly (e.g. `import "./tab.css"`) — no CSS modules, no styled-components, no Tailwind. Class names are global, so avoid overly generic ones.
- **Test focus**: 6 of 7 test files exercise pure logic in `Utility/` and `Hooks/` (no rendering) — `scaleRecipe`, `parseFraction`, `helperFunctions`, `formatIngredientDisplay`, `useConvertYeast`, `useRecipeFilter`. Only one test renders a component (`aboutMe.test.tsx`). The convention here is to unit-test domain/formatting logic thoroughly; component rendering tests are the exception, not the norm — new domain logic should get this kind of test, new components generally haven't.
- **Context guard inconsistency**: `useDrawer()` throws if called outside its provider; `useAuth()` doesn't (it silently returns `{ user: undefined }`). Don't assume one behavior applies to both — check the specific context's hook before relying on it throwing.

## Notes

- `docs/` and `.claude/` are gitignored (see `.gitignore`) — they hold local Superpowers spec/plan history and agent config, not tracked project docs. Don't treat their absence from git history as a problem, and don't expect them to exist in a fresh clone.
- File naming is inconsistent (`UseFetchRecipes.ts` vs `useToast.ts`, `YeastToggle.tsx` vs `recipeCard.tsx`) — match the convention of the file you're editing rather than trying to normalize it.
- Deploys are manual via `./deploy-breadmachine.sh`: builds, rsyncs `dist/` to a self-hosted box (`gizmo`), restarts Caddy over SSH. There is no CI/CD pipeline.
- To run the full stack locally (frontend + backend together), the Go backend needs a Firebase service account key at `/etc/breadmachine/serviceAccountKey.json` (already present on this machine, `0600` permissions) — see `README.md`. Not needed for frontend-only work; the frontend never reads this file.
- The three-agent setup described in `docs/superpowers/specs/2026-05-24-agent-setup-design.md` is fully built: `qa` globally at `~/.claude/agents/qa.md`, `backend-dev` at `breadmachine/.claude/agents/backend-dev.md`, and `frontend-dev` at `.claude/agents/frontend-dev.md` (this repo, gitignored like the rest of `.claude/`).
