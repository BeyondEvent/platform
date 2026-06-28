import { Background, Controls, ReactFlow } from '@xyflow/react';
import type { Edge, Node } from '@xyflow/react';
import { ChevronDown, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import type { SnapEdge, SnapNode, Topology } from './types';

export interface TopologyListProps {
  topologies: Topology[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onEdit: (t: Topology) => void;
  toFlowNodes: (snapNodes: SnapNode[]) => Node<{ label: string }>[];
  toFlowEdges: (snapEdges: SnapEdge[]) => Edge[];
}

export function TopologyList({
  topologies,
  expandedId,
  setExpandedId,
  onEdit,
  toFlowNodes,
  toFlowEdges,
}: TopologyListProps) {
  return (
    <ul className="space-y-3">
      {topologies.map((t) => (
        <Card
          key={t.id}
          className="border-border bg-card/40 hover:border-muted-foreground/30 overflow-hidden shadow-sm transition-all duration-200"
        >
          <div className="w-full p-4 flex items-center justify-between hover:bg-muted/5">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="text-indigo-400 font-medium">{t.snapshot.nodes.length}</span> nodes
                · <span className="text-purple-400 font-medium">{t.snapshot.edges.length}</span>{' '}
                edges · {new Date(t.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(t)}
                className="cursor-pointer font-semibold"
              >
                Edit
              </Button>
              <span className="text-border">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                className="flex items-center gap-1.5 cursor-pointer font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/20 px-2 py-1 h-8 rounded-md"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    expandedId === t.id ? 'rotate-180' : ''
                  }`}
                />
              </Button>
            </div>
          </div>

          {expandedId === t.id && (
            <CardContent className="h-72 border-t border-border bg-muted/10 p-0 relative">
              <ReactFlow
                nodes={toFlowNodes(t.snapshot.nodes)}
                edges={toFlowEdges(t.snapshot.edges)}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                fitView
              >
                <Background color="#27272a" gap={12} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </CardContent>
          )}
        </Card>
      ))}
    </ul>
  );
}
