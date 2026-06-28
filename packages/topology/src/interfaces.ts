import type { EdgeId, NodeId } from './types';

export interface TopologyNode {
  readonly id: NodeId;
  readonly type: string;
  readonly label: string;
  readonly metadata: Record<string, unknown>;
}

export interface TopologyEdge {
  readonly id: EdgeId;
  readonly source: NodeId;
  readonly target: NodeId;
  readonly label?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
}

export interface TopologySnapshot {
  readonly nodes: TopologyNode[];
  readonly edges: TopologyEdge[];
}

export interface ITopologyGraph {
  addNode(node: TopologyNode): void;
  removeNode(id: NodeId): void;
  addEdge(edge: TopologyEdge): void;
  removeEdge(id: EdgeId): void;
  getNode(id: NodeId): TopologyNode | undefined;
  getNeighbors(id: NodeId): TopologyNode[];
  validate(): ValidationResult;
  traverse(startId: NodeId, visitor: (node: TopologyNode) => void): void;
  toJSON(): TopologySnapshot;
}
