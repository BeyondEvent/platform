# Buttons Specification

Buttons trigger actions, state changes, or navigation paths. They must adhere to strict visual variations.

## 1. Visual Sizing & Variations
* **Primary (Accent Filled)**: Used for major calls to action (e.g., Run Simulation, Save Topology). Background `bg-indigo-600 hover:bg-indigo-500 text-white`.
* **Secondary (Outline)**: Used for secondary actions (e.g., Cancel, Edit Properties). Border `border border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900`.
* **Destructive**: Used for high-risk operations (e.g., Purge Queue, Terminate Worker). Background `bg-rose-600 hover:bg-rose-500 text-white`.
* **Ghost**: Used for low-emphasis triggers (e.g., Panel toggles). Background is transparent, hover state changes to `bg-zinc-900/50 text-zinc-200`.

## 2. Interactive Sizing Styles
* **Large (lg)**: `h-10 px-6 py-2 text-sm font-semibold`
* **Medium (md)**: `h-9 px-4 py-1.5 text-xs font-medium`
* **Small (sm)**: `h-7 px-3 py-1 text-xs` (ideal for inline table buttons and filters).
* **Feedback animations**: A subtle micro-scaling transition occurs on active click states (`active:scale-[0.98] transition-transform`).
