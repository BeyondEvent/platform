# Loading States Specification

To ensure a smooth perceived user experience, loading states are standard during data fetches.

## 1. Skeleton Screen Guidelines
* Skeleton containers match the dimensions and layouts of the target components (e.g. table rows, metrics cards, panels).
* **Pulse Effect**: Standard CSS keyframe pulses are applied to placeholder blocks: `animate-pulse bg-zinc-800/40 rounded`.

## 2. Dynamic Progress Indicators
* **Full-Page Loader**: When initially loading a simulation workspace, the UI renders a central spinner: a double-ring custom icon spinning smoothly (`animate-spin text-indigo-500 size-8`).
* **Mini Spinner**: Inline spinners (e.g. inside a table cell when reloading single metrics) are kept small (`size-4`).
