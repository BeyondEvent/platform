export type WorkerLifecycleState =
  | 'idle'
  | 'subscribing'
  | 'receiving'
  | 'validating'
  | 'executing'
  | 'publishing'
  | 'acking'
  | 'error';
