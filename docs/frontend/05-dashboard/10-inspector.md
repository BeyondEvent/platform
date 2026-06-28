# Worker Inspector Specification

The Worker Inspector is a key tool in debugging distributed trace steps. It displays real-time execution steps of a selected worker node.

## 1. Top Section Layout
* **Worker ID & Meta Header**: Displays selected worker instance uuid alongside active state status (e.g. `executing` in blue, `error` in red).
* **Control Actions**: Triggers for:
  * Force Pause / Kill Worker
  * Inject latency or artificial failure (Chaos trigger link).

## 2. Inbound event list & payload view
* **Inbound Table**: Houses list of last 50 events received by this worker instance. Column cells show:
  * Event type with link navigation.
  * Trace ID correlation snippet.
  * Validation payload check (Green checkbox / Red cross).
* **Payload Inspector**: JSON view (collapsible node trees) showing raw event input schemas and computed results.
