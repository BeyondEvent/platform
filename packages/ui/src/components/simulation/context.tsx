import type { Edge, Node } from '@xyflow/react';
import { createContext, useContext } from 'react';

export type SimulationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';

export interface Simulation {
  id: string;
  name: string;
  status: SimulationStatus;
  topologyId: string | null;
  createdAt: string;
}

export interface SnapNode {
  id: string;
  type: string;
  label: string;
  metadata: Record<string, unknown>;
}

export interface SnapEdge {
  id: string;
  source: string;
  target: string;
  label?: string | undefined;
}

export interface Topology {
  id: string;
  name: string;
  snapshot: { nodes: SnapNode[]; edges: SnapEdge[] };
}

export interface TopologyStub {
  id: string;
  name: string;
}

export interface EventPayload {
  source?: string;
  target?: string;
  message?: string;
  [key: string]: unknown;
}

export interface PersistedEvent {
  id: string;
  type: string;
  payload: EventPayload;
  traceId: string;
  spanId: string;
  correlationId: string;
  causationId: string | null;
  simulationId: string | null;
  version: number;
  occurredAt: string;
  createdAt: string;
}

export interface MutationStub<TVariables = void> {
  isPending: boolean;
  mutate: (variables: TVariables, options?: { onSuccess?: () => void }) => void;
}

export interface SimulationContextType {
  sim: Simulation;
  topology: Topology | undefined;
  persistedEvents: PersistedEvent[];
  mostRecentEvent: PersistedEvent | null;
  expandedEventId: string | null;
  setExpandedEventId: (id: string | null) => void;
  activeSourceId: string | undefined;
  activeTargetId: string | undefined;
  activeNodeIds: string[];
  expandedNodeIds: string[];
  flowNodes: Node<{ label: string }>[];
  flowEdges: Edge[];
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  replayEventMutation: MutationStub<string>;
  replaySimMutation: MutationStub<void>;
  statusMutation: MutationStub<string>;
  renameMutation: MutationStub<string>;
  refetchEvents: () => void;
  topologySelectorOpen: boolean;
  setTopologySelectorOpen: (open: boolean) => void;
  allTopologies: TopologyStub[];
  linkTopologyMutation: MutationStub<string | null>;
  pendingTopologyId: string;
  setPendingTopologyId: (id: string) => void;
}

export const SimulationContext = createContext<SimulationContextType | null>(null);

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
