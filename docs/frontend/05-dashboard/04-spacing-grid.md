# Spacing & Grid System Specification

BeyondEvent layouts are built upon a strict **4px-base grid system** to keep alignments sharp and prevent Cumulative Layout Shift (CLS) during high-throughput real-time events.

## 1. Spacing Scale

Every gap, padding, and margin must conform to the 4px multiplication scale:

| Token | Pixels | Rem Value | Tailwind Class | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Grid 1** | 4px | 0.25rem | `p-1` / `gap-1` / `m-1` | Badge paddings, micro-margins |
| **Grid 2** | 8px | 0.5rem | `p-2` / `gap-2` / `m-2` | Element spacing in forms, table cell paddings |
| **Grid 3** | 12px | 0.75rem | `p-3` / `gap-3` / `m-3` | Dropdown lists, card inner items |
| **Grid 4** | 16px | 1.0rem | `p-4` / `gap-4` / `m-4` | Standard card margins, simple panel paddings |
| **Grid 6** | 24px | 1.5rem | `p-6` / `gap-6` / `m-6` | Primary dashboard layouts, view side columns |
| **Grid 8** | 32px | 2.0rem | `p-8` / `gap-8` / `m-8` | Large empty-state zones, dialog offsets |

## 2. Layout Positioning Safety
* **Avoid Hardcoded Widths/Heights**: Use layout flex and grids (`flex-1`, `w-full`, `col-span-12`) rather than explicit pixel boundaries.
* **Component-Level Gaps**: When rendering high-frequency streaming lists (like the event timeline), standard cell container heights must be fixed (e.g., `h-8` or `h-10`) to prevent jumpy layout behavior on stream additions.
