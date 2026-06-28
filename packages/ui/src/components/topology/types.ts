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
  createdAt: string;
}
