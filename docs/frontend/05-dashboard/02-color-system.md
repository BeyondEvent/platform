# Color System Specification

BeyondEvent's color system focuses on a clean dark-first theme interface, utilizing slate and zinc neutral bases paired with expressive status indicators.

## 1. Neutral Scales (Tailwind Zinc)
* **Backgrounds**: `zinc-950` (`#09090b`) for dark mode background, `white` (`#ffffff`) for light mode.
* **Borders & Inputs**: `zinc-800` (`#27272a`) in dark, `zinc-200` (`#e4e4e7`) in light.
* **Primary Foreground**: `zinc-50` (`#fafafa`) in dark, `zinc-900` (`#18181b`) in light.

## 2. Accents & Semantics
* **Primary Highlight**: Indigo-600 (`#4f46e5`) and Indigo-400 (`#818cf8`) for active links and selections.
* **Service/Queue Accents**:
  * **Services**: Teal-500 (`#14b8a6`) — represents business domain logical boundaries.
  * **Queues**: Purple-500 (`#a855f7`) — represents asynchronous transfer nodes.
  * **Workers**: Cyan-500 (`#06b6d4`) — represents computation and processing blocks.

## 3. Simulation & Event Status Colors
The dashboard leverages precise color codes to convey state:

| State | Color Scale | Dark HEX | Light HEX | Standard Class |
| :--- | :--- | :--- | :--- | :--- |
| **Pending** | Amber-500 | `#f59e0b` | `#d97706` | `bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400` |
| **Running** | Blue-500 | `#3b82f6` | `#2563eb` | `bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400` |
| **Completed** | Emerald-500 | `#10b981` | `#059669` | `bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400` |
| **Failed** | Rose-500 | `#f43f5e` | `#e11d48` | `bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400` |
| **Paused / Idle** | Zinc-500 | `#71717a` | `#52525b` | `bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300` |
