import type { ICounter, IGauge, IHistogram, IMetricsRegistry, ITimer } from './interfaces';

const noop = (): void => undefined;

const noopCounter: ICounter = { increment: noop, add: noop };
const noopGauge: IGauge = { set: noop, increment: noop, decrement: noop };
const noopHistogram: IHistogram = { observe: noop };
const noopTimer: ITimer = {
  start: () => {
    const t = Date.now();
    return () => Date.now() - t;
  },
};

// Phase 2 — Real MetricsRegistry:
// Replace with PrometheusMetricsRegistry (prom-client) or OTEL SDK.
// 1. Install prom-client in apps/api
// 2. Implement PrometheusMetricsRegistry using prom-client Counter/Gauge/Histogram
// 3. Expose GET /metrics in apps/api for Prometheus scraping
// 4. Register all instruments at startup (not lazily) to avoid races
export const NoopMetricsRegistry: IMetricsRegistry = {
  counter: () => noopCounter,
  gauge: () => noopGauge,
  histogram: () => noopHistogram,
  timer: () => noopTimer,
};
