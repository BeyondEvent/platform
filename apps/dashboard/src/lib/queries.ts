import type {
  PersistedEvent,
  Simulation,
  SharedTopology as Topology,
  TopologyStub,
  Worker,
} from '@beyondevent/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ── Base API Client ──────────────────────────────────────────────────
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (options?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Query Hooks ──────────────────────────────────────────────────────

export function useSimulationsQuery() {
  return useQuery({
    queryKey: ['simulations'],
    queryFn: () => apiRequest<Simulation[]>('/api/v1/simulations'),
  });
}

export function useSimulationQuery(id: string) {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: () => apiRequest<Simulation>(`/api/v1/simulations/${id}`),
    enabled: !!id,
  });
}

export function useTopologiesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['topologies'],
    queryFn: () => apiRequest<Topology[]>('/api/v1/topologies'),
    enabled: options?.enabled ?? true,
  });
}

export function useTopologyQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: ['topology', id],
    queryFn: () => apiRequest<Topology>(`/api/v1/topologies/${id}`),
    enabled: !!id,
  });
}

export function useWorkersQuery() {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => apiRequest<Worker[]>('/api/v1/workers'),
    refetchInterval: 5_000,
  });
}

export function useSimulationEventsQuery(simulationId: string) {
  return useQuery({
    queryKey: ['events', simulationId],
    queryFn: () =>
      apiRequest<PersistedEvent[]>(
        `/api/v1/events?simulationId=${simulationId}&limit=100&order=desc`,
      ),
    refetchInterval: 30_000,
    enabled: !!simulationId,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────────────

export function useCreateSimulationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; topologyId?: string }) =>
      apiRequest<Simulation>('/api/v1/simulations', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['simulations'] });
    },
  });
}

export function useUpdateSimulationStatusMutation(simulationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) =>
      apiRequest<Simulation>(`/api/v1/simulations/${simulationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['simulation', simulationId], updated);
    },
  });
}

export function useRenameSimulationMutation(simulationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiRequest<Simulation>(`/api/v1/simulations/${simulationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['simulation', simulationId], updated);
    },
  });
}

export function useLinkTopologyMutation(simulationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (topologyId: string | null) =>
      apiRequest<Simulation>(`/api/v1/simulations/${simulationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ topologyId }),
      }),
    onSuccess: (updated) => {
      qc.setQueryData(['simulation', simulationId], updated);
      qc.invalidateQueries({ queryKey: ['topology'] });
    },
  });
}

export function useReplayEventMutation(refetchEvents: () => void) {
  return useMutation({
    mutationFn: (eventId: string) =>
      apiRequest<{ replayed: number }>(`/api/v1/replay/event/${eventId}`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => refetchEvents(),
  });
}

export function useReplaySimulationMutation(simulationId: string, refetchEvents: () => void) {
  return useMutation({
    mutationFn: () =>
      apiRequest<{ replayed: number }>(`/api/v1/replay/simulation/${simulationId}`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => refetchEvents(),
  });
}

export function useSaveTopologyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id?: string;
      name: string;
      nodes: unknown[];
      edges: unknown[];
    }) => {
      const url = payload.id ? `/api/v1/topologies/${payload.id}` : '/api/v1/topologies';
      const method = payload.id ? 'PATCH' : 'POST';
      return apiRequest<Topology>(url, {
        method,
        body: JSON.stringify({
          name: payload.name,
          nodes: payload.nodes,
          edges: payload.edges,
        }),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['topologies'] });
    },
  });
}
