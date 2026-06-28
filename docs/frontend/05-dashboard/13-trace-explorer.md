# Trace Explorer Specification

The Trace Explorer provides a tree/flame visualization of individual transactional flows, mapping how an initial event cascades across workers.

## 1. Trace Hierarchy Visualization
* **Top Summary Block**: Lists root event type, overall transaction duration, and total spans completed.
* **Gantt / Flame Chart**: Horizontal lanes representing service execution times:
  * Lanes display Span Name, Start Offset, and Execution Duration.
  * Colors indicate outcomes (Green for success, Red for failure/error).
* **Causal Link Tree**: Node tree representation showing parent-child links reconstructable via `SpanId` and `CausationId`.

## 2. Telemetry Navigation
* Clicking a trace row opens the raw payload panel on the right sidebar.
* A "Replay Trace" button sends a request to the backend trigger `POST /api/v1/replay/trace/:id` to rerun this trace chain under observation.
