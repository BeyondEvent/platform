# Worker Monitor Specification

The Worker Monitor presents a macro view of the entire processing pool cluster, summarizing thread loads, processing rates, and worker errors.

## 1. Pool Status Grid Layout
* Displays small cards for each worker instance. Each card contains:
  * Worker ID and Name.
  * Version metadata tag.
  * Active state color badge (`idle`, `receiving`, `executing`, `error`).
  * Processed count gauge (small sparkline showing throughput trend).

## 2. Global Actions Bar
* **Scale Cluster**: Form input slider to spin up/down simulated worker instances.
* **Global Pause**: Instantly pauses processing pipelines for all workers in the pool to inspect queue accumulation.
