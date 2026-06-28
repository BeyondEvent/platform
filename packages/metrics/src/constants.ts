export const MetricNames = {
  EVENT_THROUGHPUT: 'beyondevent.event.throughput',
  EVENT_LATENCY: 'beyondevent.event.latency',
  EVENT_ERRORS: 'beyondevent.event.errors',
  WORKER_RETRIES: 'beyondevent.worker.retries',
  DLQ_SIZE: 'beyondevent.dlq.size',
  CONSUMER_LAG: 'beyondevent.consumer.lag',
  QUEUE_DEPTH: 'beyondevent.queue.depth',
} as const;
