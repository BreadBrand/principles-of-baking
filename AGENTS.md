# Baking Principles — Agent Guide 🍞

This repository is the frontend for **breadmachine.dev** — a web application that helps beginner bakers convert dry-yeast bread recipes to sourdough (and back), scale recipes using baker's percentage, and manage bake-day scheduling.

## 🎯 Quick Start For Agents

```bash
# Install dependencies
npm install

# Setup environment (edit or create .env.local)
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Run dev server + backend API together (backend in sibling breadmachine repo)
cd ../breadmachine && go run main.go &  # runs on port 8080
npm run dev                               # runs frontend, proxies /api requests
```

## 📦 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Global CSS files per component (no modules/Tailwind)
- **Auth & Data**: Firebase Auth only via Go backend endpoints (**never use Firestore SDK directly**)
- **Testing**: Vitest with `jsdom` environment, test-utils pattern (`*.test.ts`)

## 🚀 Commands

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server (proxies `/api/` → backend) |
| `npm run build` | Build with TypeScript + minification |
| `npm test` | Vitest watch mode |
| `npx vitest run` | Run full suite once (CI-style, no watch) |
| `npm run lint` | ESLint — **zero tolerance** for warnings |
| `npm run typecheck` | TypeScript check (`noUnusedLocals`, etc. enforced) |

## 🏗️ Architecture Overview

### Core Data Flow: Frontend Never Talks to Firestore!

```
┌─────────────┐           ┌──────────┐          ┌──────────┐
│   Client    │  Bearer    │  Go API  │       Fire-      │
│ (React app) │◄──────────▶│         │────────►  store     │
│             │   token    │(net/http)│        Firestore  │
└─────────────┘            └──────────┘          └──────────┘
```

- **All API calls** hit relative paths (e.g., `/api/recipes`) through a Go backend
- `firebase.ts` only reads auth state (`getAuth()`), never Firestore SDK methods
- Authenticated writes attach Firebase ID token as Bearer header:  
  ```typescript
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('Not authenticated');
  headers.add('Authorization', `Bearer ${idToken}`);
  ```

### Key Contexts (React Provider Pattern)

| Context | Purpose | Usage Pattern |
|---|---|---|
| `RecipeContext` | Global recipe list (`fetchRecipes`, mutation results) | Imported where recipes are displayed/edited |
| `AuthContext` | Firebase auth state → `{user: User\|null\|undefined}` | Returns `useAuth()` — **does not throw** if used outside provider |
| `DrawerContext` | Mobile drawer UI (`open`) + selected tab & recipe ID | Returns `useDrawer()` — **throws** if called without context (unlike auth) |

### Router Routes (`react-router-dom`)

- `/` → Landing page
- `/tab` → Main app with tabs: explorer, scaler, dough temp calc, onboarding steps, scheduler, add/parse recipe  
  (auth-gated tools conditionally rendered based on `useAuth()`, not route guards)
- `/learn`, `/learning/step/:step` → Onboarding flow
- `/about-me` → About page

### Domain Logic Utilities (`Utility/*.ts`)

| Utility | Purpose | Note if bugs appear |
|---|---|---|
| `ingredientMatchers.ts` | Identify flour/water/yeast/starter ingredients via **simple substring matching** (e.g., name. includes("flour")) | Fragile to unusual ingredient names — first thing to check when conversions fail |
| `scaleRecipe.ts` | Scale recipe quantities using baker's percentage math | Core conversion logic; test output with edge cases <60g/grams |
| `useConvertYeast.ts` | Convert dry-yeast ↔ sourdough starter ratios | Depends on ingredient matcher — bugs often stem from mismatched names, not formula errors |
| `formatIngredientDisplay.ts` | Grams/mL → user-facing units (g / cups / tbsp / tsp) with rounding thresholds (`CONVERSION_THRESHOLD = 60`) format quantities ad hoc; always use this utility instead |

### Type System: Models vs DTOs

Due to a schema migration legacy, two parallel type sets exist intentionally:

- **`types/models.ts`** → Stored document shape (current fields: `doughIngredients`, `otherIngredients`)
  - Has `ingredients` field only in old documents — `useFetchRecipes` normalizes them to current format on load |
- **`types/dto.ts`** → Parsing/creation shape (`IngredientDTO`, `RecipeDTO`) includes metadata like `rawLine`, `parseOK`, confidence levels for parser results. Used when creating recipes from freeform text via `/api/recipes/parse`.

## 🧪 Testing Patterns (Best Practices)

1. **Unit tests over component rendering** — 6 of 7 test files exercise pure logic in `Utility/*.ts` and hooks; only one (`aboutMe.test.tsx`) renders a component
2. Unit-test domain/formatting logic thoroughly for new features
3. Tests are colocated: `FooUtils.test.ts` adjacent to `FooUtils.ts`; don't separate them

### Common Test Patterns

```typescript
// Pure utility test (most common)
import { describe, it, expect } from 'vitest'; // globals set in vite.config.js; no explicit import needed!
describe('scaleRecipe', () => { /* tests */ });

// Simple format function test  
it.each([/* input, expected unit pairs */])(%s → %s", (input) => { ...});

// Component rendering edge case only when truly visual
import '@testing-library/react'; // for render(), queries like screen.getByRole()

describe('AboutMe component', () => { /* basic sanity checks - no deep snapshot tests yet*/ });
```

## ⚠️ Common Pitfalls & Gotchas

- **Backend endpoints `/api/recipes/{id}` (GET) and DELETE are BROKEN** — do not add frontend UI that depends on them; fix backend first. Current UI reads from already-fetched `RecipeContext` instead of fetching by ID or deleting in real-time
- The app supports sourdough recipe creation via a **freeform-text parsing API**. Parsing logic lives in the Go backend (`/api/recipes/parse`) — if parsed results look wrong, check ingredient name matching first (substring-based: "whole wheat" matches any name containing "wheat")!
- File naming convention is inconsistent across components like `useToast.ts` vs. UseFetchRecipes.ts; match whatever style you're editing rather than forcing uniformity

## 📝 Coding Conventions

### Hooks Pattern — Return Shape Always Same For All Data Fetching/Action Hooks

```typescript 
// ✓ Standard pattern: plain object with state/action methods
export const useRecipe = () => {
  // ...state and loading handling here...
  
  return { recipes, selectedId, isLoading, error, selectRecipe };
};   /* Note never a class or reducer. always follow this pattern */

```

- `error` is **always** `string | null`, set in catch blocks, cleared after actions complete (like `finally`). Use plain state updates — no complex reducers unless absolutely necessary for edge cases requiring it! 

### Styling Pattern: Local Per Component Global Stylesheet Import

```tsx
// component.tsx file contains styling alongside implementation  
import './component.css';  // imported at top of TSX, global CSS classes but avoid globally generic names. 
export default function MyComponent() {...}
```

## 🔍 When You Hit A Bug: Debugging Checklist

1. Is ingredient name matching the expected pattern in `ingredientMatchers.ts`? Check if it contains "flour", "water", or equivalent substring! **This is often root cause** since logic depends on string patterns rather than structured lookups
2. Does backend parse endpoint `/api/recipes/parse` accept input without throwing first errors before building frontend UI around those results (e.g., confidence level fields)

3. Check if `CONVERSION_THRESHOLD = 60` in constants matches current user expectations; adjust only after confirming threshold causes no regression elsewhere
4. Review API contract tables — endpoints may be marked "known gap" for missing functionality! Don't assume they exist just because similar routes do work (e.g., GET `/api/recipes/{id}` doesn't return a single recipe by ID currently)

## 📚 Related Documents & Links

- **CLAUDE.md** → more detailed guidance specifically written up before Claude Code; see it for deep dives on auth token pattern, context guard differences (`useAuth()` vs `useDrawer()`)
- Backend repo: `../breadmachine` (Go/Firebase Firestore) — check here if you need API contract details not captured in frontend-only docs
 - .claude/agents/frontend-dev.md → AI agent persona configuration for consistent code review practices across sessions

## 🛡️ Security Notes For Agents Work On Authentication Or File Paths: 

- Never commit `.env.local` or any Firebase service account keys  
- Frontend never touches `serviceAccountKey.json`; backend handles it at `/etc/breadmachine/serviceAccountKey.json`. If you see file access attempts on the frontend code for this path, something's wrong.
- When in doubt about whether to use environment variables like VITE_API_URL vs VITE_API_BASE: **check existing usage** — they serve different purposes! (Vite dev server proxy target is `*`; API base overrides are separate!)

## ✨ How To Contribute Or Add Features Without Breaking Things 

1. Read CLAUDE.md for full tech details first before coding
2. Check agent config in AGENTS.md to ensure consistent patterns matching existing codebase style!  
3. Write tests FIRST as per Vitest/React pattern conventions outlined above
4. Run `npm typecheck` and `npx vitest run` locally with new logic you added or changed — these must pass before committing anything substantial
