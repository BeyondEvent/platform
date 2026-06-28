import { Background, Controls, Panel, ReactFlow } from '@xyflow/react';
import type { Connection, Edge, Node, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import type * as React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export interface TopologyEditorProps {
  topologyName: string;
  setTopologyName: (name: string) => void;
  newNodeLabel: string;
  setNewNodeLabel: (label: string) => void;
  nodes: Node<{ label: string }>[];
  onNodesChange: OnNodesChange<Node<{ label: string }>>;
  setNodes: React.Dispatch<React.SetStateAction<Node<{ label: string }>[]>>;
  edges: Edge[];
  onEdgesChange: OnEdgesChange;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onConnect: (params: Connection) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  edgeLabelValue: string;
  setEdgeLabelValue: (val: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveError: string | null;
  editingId: string | null;
  handleAddNode: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function TopologyEditor({
  topologyName,
  setTopologyName,
  newNodeLabel,
  setNewNodeLabel,
  nodes,
  onNodesChange,
  setNodes,
  edges,
  onEdgesChange,
  setEdges,
  onConnect,
  onEdgeClick,
  onPaneClick,
  selectedEdgeId,
  setSelectedEdgeId,
  edgeLabelValue,
  setEdgeLabelValue,
  isSaving,
  onSave,
  onCancel,
  saveError,
  editingId,
  handleAddNode,
}: TopologyEditorProps) {
  return (
    <Card className="bg-card border-border shadow-xl">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="text-md font-semibold text-foreground">
              {editingId ? 'Edit Topology Service Graph' : 'Design New Service Graph'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <label htmlFor="topology-name-editor" className="sr-only">
                Topology Name
              </label>
              <Input
                id="topology-name-editor"
                type="text"
                value={topologyName}
                onChange={(e) => setTopologyName(e.target.value)}
                placeholder="e.g. Payments Gateway Graph"
                className="h-8 max-w-sm text-sm font-semibold bg-background border-border text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2 self-end">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave} disabled={isSaving || !topologyName.trim()}>
              {isSaving ? 'Saving…' : 'Save Topology'}
            </Button>
          </div>
        </div>
        {saveError && <p className="text-xs text-rose-500 font-semibold mt-2">{saveError}</p>}
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Node Creation Panel */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-4 h-fit md:col-span-1 shadow-sm">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1.5">
              Service Nodes
            </h3>
            <form onSubmit={handleAddNode} className="space-y-3">
              <div className="space-y-1">
                <label
                  htmlFor="node-label-editor"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
                >
                  New Component Name
                </label>
                <Input
                  id="node-label-editor"
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="e.g. PaymentSvc"
                  className="h-8 text-xs bg-background border-border text-foreground"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full h-8 text-xs font-semibold"
                disabled={!newNodeLabel.trim()}
              >
                + Add Service Node
              </Button>
            </form>
            <div className="pt-2 border-t border-border/80">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                💡 <span className="font-semibold text-foreground">Canvas Controls</span>:<br />-
                Click & drag nodes to position them.
                <br />- Drag connections between nodes to link events.
                <br />- Select a connector line to set event names.
                <br />- Select a connector line and press Backspace/Delete to remove.
              </p>
            </div>
          </div>

          {/* Interactive Topology Graph Canvas */}
          <div className="h-[420px] border border-border rounded-xl overflow-hidden bg-background md:col-span-3 relative shadow-inner">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              fitView
            >
              <Background color="#27272a" gap={16} />
              <Controls showInteractive={true} />
            </ReactFlow>
          </div>
        </div>

        {/* Connection Event Name Editor */}
        {selectedEdgeId && (
          <div className="bg-muted border border-border p-3.5 rounded-lg flex items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex-1 min-w-0">
              <label
                htmlFor="connection-event-name-input"
                className="text-xs font-semibold text-muted-foreground block mb-1 uppercase tracking-wider"
              >
                Set Event Name for Selected Connection
              </label>
              <Input
                id="connection-event-name-input"
                type="text"
                value={edgeLabelValue}
                onChange={(e) => setEdgeLabelValue(e.target.value)}
                placeholder="e.g. order.received, payment.processed"
                className="w-full h-8 text-xs font-mono bg-background border-border text-foreground"
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button
                size="sm"
                onClick={() => {
                  setEdges((eds) =>
                    eds.map((e) =>
                      e.id === selectedEdgeId
                        ? { ...e, label: edgeLabelValue.trim() || undefined }
                        : e,
                    ),
                  );
                  setSelectedEdgeId(null);
                  setEdgeLabelValue('');
                }}
              >
                Set Name
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
                  setSelectedEdgeId(null);
                  setEdgeLabelValue('');
                }}
                className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 font-semibold"
              >
                Delete Link
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
