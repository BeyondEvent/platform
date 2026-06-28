import type { ITopologyGraph, TopologyEdge, TopologyNode } from './interfaces';
import type { EdgeId, NodeId } from './types';

export function createTopologyGraph(): ITopologyGraph {
  const nodes = new Map<NodeId, TopologyNode>();
  const edges = new Map<EdgeId, TopologyEdge>();
  const adjacency = new Map<NodeId, Set<NodeId>>();

  return {
    addNode(node) {
      nodes.set(node.id, node);
      if (!adjacency.has(node.id)) adjacency.set(node.id, new Set());
    },

    removeNode(id) {
      nodes.delete(id);
      adjacency.delete(id);
      for (const [edgeId, edge] of edges) {
        if (edge.source === id || edge.target === id) edges.delete(edgeId);
      }
    },

    addEdge(edge) {
      edges.set(edge.id, edge);
      const neighbors = adjacency.get(edge.source) ?? new Set<NodeId>();
      neighbors.add(edge.target);
      adjacency.set(edge.source, neighbors);
    },

    removeEdge(id) {
      const edge = edges.get(id);
      if (edge !== undefined) {
        adjacency.get(edge.source)?.delete(edge.target);
        edges.delete(id);
      }
    },

    getNode(id) {
      return nodes.get(id);
    },

    getNeighbors(id) {
      const neighborIds = adjacency.get(id) ?? new Set<NodeId>();
      const result: TopologyNode[] = [];
      for (const neighborId of neighborIds) {
        const node = nodes.get(neighborId);
        if (node !== undefined) result.push(node);
      }
      return result;
    },

    validate() {
      const errors: string[] = [];
      for (const edge of edges.values()) {
        if (!nodes.has(edge.source))
          errors.push(`Edge ${edge.id}: source node ${edge.source} does not exist`);
        if (!nodes.has(edge.target))
          errors.push(`Edge ${edge.id}: target node ${edge.target} does not exist`);
      }
      return { valid: errors.length === 0, errors };
    },

    traverse(startId, visitor) {
      const visited = new Set<NodeId>();
      const queue: NodeId[] = [startId];
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined || visited.has(current)) continue;
        visited.add(current);
        const node = nodes.get(current);
        if (node !== undefined) {
          visitor(node);
          const neighbors = adjacency.get(current) ?? new Set<NodeId>();
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) queue.push(neighbor);
          }
        }
      }
    },

    toJSON() {
      return { nodes: [...nodes.values()], edges: [...edges.values()] };
    },
  };
}
