# @beyondevent/metrics

Observability interfaces for BeyondEvent. Implementation deferred to Phase 2.

## Exports

- **Interfaces**: `ICounter`, `IGauge`, `IHistogram`, `ITimer`, `IMetricsRegistry`
- **Constants**: `MetricNames` — standard metric keys (throughput, latency, retries, DLQ size, consumer lag, queue depth)
- **`NoopMetricsRegistry`** — no-op implementation for use in tests and bootstrap phase
