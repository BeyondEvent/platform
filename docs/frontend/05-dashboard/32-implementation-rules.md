# Implementation Rules

Strict guidelines enforce design system compliance and prevent technical debt in the frontend codebase.

## 1. Style & Styling Rules
* **Theme Variables Only**: Never use raw hex values (`#ff0000`) or custom inline spacing classes. Map design system variables (`bg-primary`, `border-border`, `p-4`) directly.
* **Component-First Strategy**: Before implementing any layout block (like a table, dropdown, or modal input), check if a standard reusable component is available inside `@beyondevent/ui`. If missing, build it as a reusable component in the package first.

## 2. API & Data Isolation Rules
* **No Direct Fetching**: All HTTP calls must go through TanStack Query query/mutation definitions.
* **Branded Types Safety**: Always preserve branded types (e.g. `SimulationId`, `TraceId`) when typing props or state slices to avoid compiling issues.
