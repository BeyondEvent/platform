# Reusable Tables Specification

To maintain structural and styling alignment throughout the application, all data grids (Simulations list, Events logs, Trace lists, Worker nodes) must utilize a standardized, reusable Table component built on **TanStack Table** (`@tanstack/react-table`) and **TanStack Query** (`@tanstack/react-query`).

## 1. Unified Component Design: `@beyondevent/ui`
A core `DataTable` wrapper component is exposed in the shared UI package:

```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  queryKey: QueryKey
  queryFn: (context: QueryFunctionContext) => Promise<TData[]>
  pageSize?: number
  enablePagination?: boolean
  enableSorting?: boolean
}
```

This component encapsulates:
* **TanStack Query Integration**: Binds the table lifecycle directly to TanStack Query's caching, polling, and prefetching states.
* **Unified Styling**:
  * Borders default to `border-zinc-800` (in dark mode).
  * Cell paddings are restricted to Grid 2 (`py-2 px-4`).
  * Table headers utilize caps lettering (`text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-muted/40`).

## 2. Interactive Features
* **Sorting Indication**: Clickable headers display up/down indicator carats (e.g., `▲` / `▼`) using subtle animations.
* **Smart Pagination**: Clean controls at the bottom showing:
  * Current page and total count indicator (e.g., "Page 1 of 12").
  * Next/Previous button triggers.
* **Virtualized Rows**: For high-throughput event logging lists, rows are virtualized (using `@tanstack/react-virtual`) to render only visible DOM nodes, guaranteeing sub-millisecond scrolling performance.
