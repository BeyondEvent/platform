# Metrics Visualization Specification

BeyondEvent exposes key telemetry markers. The UI translates these metrics into real-time interactive charts (utilizing Recharts or standard SVG graphics).

## 1. Primary Chart Types
* **Throughput Line Chart**: Represents event publishing rates (Events per Second - EPS). Renders a smooth area-filled line (filled with `teal-500/10` stroke `teal-500`).
* **Latency Histogram**: Visualizes execution delay intervals across worker blocks.
* **Consumer Lag Gauge**: Double-arc circular gauge highlighting lag limits for asynchronous queues.

## 2. Telemetry Refresh Policies
* **Dynamic WebSocket Stream**: Metrics update incrementally via socket messages (`metrics:updated`).
* **Smoothing Interval**: Inbound data points should be batched on a 1-second rolling average to prevent high frequency component re-renders.
* **Fallback Static Fetch**: Fallback query keys `['metrics', simulationId]` query databases if WS connection drops.
