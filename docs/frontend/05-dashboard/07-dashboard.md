# Dashboard Specification

The default dashboard landing route `/` provides an entry point to monitor system activities, overview existing configurations, and initiate new test simulations.

## 1. Top Section Layout
* **Actionable Header**: Displays "Simulations" alongside a "+ New Simulation" button.
* **Inline Form Creation Pane**: Collapsible form that exposes fields for:
  * Simulation Name (text input with auto-focus validation).
  * Topology (select dropdown listing saved topology graph models).
  * Validation schema using Zod; clicking "Create" posts a POST request to `/api/v1/simulations` and navigates the client route directly to the newly created `/simulations/:id` pane.

## 2. Simulations Grid List
* Powered by **TanStack Table** with **TanStack Query** query keys `['simulations']`.
* Columns represented:
  1. **Name**: Displays simulation title with link navigation to detail view.
  2. **Created At**: Relative time formatted string.
  3. **Topology**: Name of the linked topology structure, or "None" indicator.
  4. **Status**: Rounded status indicator badge with color codes matching states (`pending`, `running`, `paused`, `completed`, `failed`).
* Hover actions: Hovering a row outlines it in border `zinc-700` and changes backgrounds to `muted/30`.
