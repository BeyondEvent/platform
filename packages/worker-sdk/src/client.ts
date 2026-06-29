import type { WorkerLifecycleState } from './types';

export interface WorkerApiClientOptions {
  readonly apiUrl: string;
  readonly workerId: string;
  readonly name: string;
  readonly version: string;
  readonly tags?: string[] | undefined;
  readonly heartbeatIntervalMs?: number | undefined;
}

export interface WorkerRegistration {
  readonly rowId: string;
  readonly deregister: () => Promise<void>;
  readonly updateState: (state: WorkerLifecycleState) => Promise<void>;
  readonly stopHeartbeat: () => void;
}

export async function registerWorker(
  opts: WorkerApiClientOptions,
  getState: () => WorkerLifecycleState,
): Promise<WorkerRegistration> {
  const base = opts.apiUrl.replace(/\/$/, '');

  async function apiRequest(path: string, options: RequestInit = {}): Promise<unknown> {
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
    if (res.status === 204) return null;
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`WorkerApiClient ${res.status} ${path}: ${text}`);
    }
    return res.json() as unknown;
  }

  const row = (await apiRequest('/api/v1/workers', {
    method: 'POST',
    body: JSON.stringify({
      workerId: opts.workerId,
      name: opts.name,
      version: opts.version,
      tags: opts.tags ?? [],
    }),
  })) as { id: string };

  const rowId = row.id;

  async function updateState(state: WorkerLifecycleState): Promise<void> {
    await apiRequest(`/api/v1/workers/${rowId}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ state }),
    });
  }

  const heartbeatInterval = setInterval(() => {
    void updateState(getState()).catch(() => undefined);
  }, opts.heartbeatIntervalMs ?? 5_000);

  return {
    rowId,
    updateState,
    async deregister() {
      clearInterval(heartbeatInterval);
      await apiRequest(`/api/v1/workers/${rowId}`, { method: 'DELETE' });
    },
    stopHeartbeat() {
      clearInterval(heartbeatInterval);
    },
  };
}
