# Performance Best Practices

Real-time canvas updates with high throughput logs require optimization to prevent frame rate drops.

## 1. Minimizing Component Re-renders
* **React Flow Optimization**: Custom nodes must be memoized (`React.memo`) to avoid constant updates when dragging nodes.
* **Selective State Selectors**: When consuming Zustand store variables, utilize precise shallow selectors (e.g. `useEventStore((s) => s.events)`) rather than pulling the entire store block.
* **Canvas Edge Simplification**: Do not animate connections during panning or zooming actions; restrict edge pulsing animation loops to inactive view states.

## 2. Telemetry Loading & Catching
* **Query Caching**: Leverage TanStack Query cache properties (`staleTime: 5000`) for non-streaming metrics to avoid API flooding.
* **List Virtualization**: Inbound logs timeline must use row virtualization (`@tanstack/react-virtual`) to prevent memory leaks when handling over 100+ events.
