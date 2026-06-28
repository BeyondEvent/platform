export interface ICounter {
  increment(labels?: Record<string, string>): void;
  add(value: number, labels?: Record<string, string>): void;
}

export interface IGauge {
  set(value: number, labels?: Record<string, string>): void;
  increment(labels?: Record<string, string>): void;
  decrement(labels?: Record<string, string>): void;
}

export interface IHistogram {
  observe(value: number, labels?: Record<string, string>): void;
}

export interface ITimer {
  start(): () => number;
}

export interface IMetricsRegistry {
  counter(name: string, description: string): ICounter;
  gauge(name: string, description: string): IGauge;
  histogram(name: string, description: string, buckets?: number[]): IHistogram;
  timer(name: string, description: string): ITimer;
}
