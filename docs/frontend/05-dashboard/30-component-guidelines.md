# Component Organization Guidelines

BeyondEvent utilizes modular package design rules to maintain clean boundaries between apps and libraries.

## 1. Directory Structure inside `apps/dashboard`
Files under `apps/dashboard/src` are structured as follows:
* `routes/`: File-system routing definitions (TanStack Router).
* `layouts/`: Master structural shells (e.g. `root-layout.tsx`).
* `store/`: Zustand state modules (like `app-store.ts`, `event-store.ts`).
* `lib/`: Helper utilities (e.g., websocket connectivity wrappers).

## 2. Reusable UI Components inside `packages/ui`
To ensure design uniformity throughout the project:
* Common controls (Buttons, Badges, Inputs, Dialogs, and custom TanStack `DataTable` templates) live in `packages/ui/src/components`.
* They must be presentational (no local database actions, pino logging imports, or direct network request dispatches).
* Barrel exports (e.g., `export * from './components/button'`) in `packages/ui/src/index.ts` must expose all components.
