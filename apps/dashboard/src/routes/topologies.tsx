import '@xyflow/react/dist/style.css';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useDeleteTopologyMutation,
  useSaveTopologyMutation,
  useTopologiesQuery,
} from '@/lib/queries';
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  TopologyEditor,
  TopologyList,
} from '@beyondevent/ui';
import type { SharedTopology, SnapEdge, SnapNode } from '@beyondevent/ui';
import { createFileRoute } from '@tanstack/react-router';
import { addEdge, useEdgesState, useNodesState } from '@xyflow/react';
import type { Connection, Edge, Node } from '@xyflow/react';
import { Loader2, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';

type FlowNode = Node<{ label: string }>;

function toFlowNodes(snapNodes: SnapNode[]): FlowNode[] {
  return snapNodes.map((n, i) => {
    const pos = n.metadata?.position as { x: number; y: number } | undefined;
    return {
      id: n.id,
      type: 'default',
      position: pos || { x: (i % 4) * 200, y: Math.floor(i / 4) * 120 },
      data: { label: n.label },
      style: {
        background: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '10px 14px',
        fontSize: '0.8125rem',
        fontWeight: '600',
      },
      className: 'border-border',
    };
  });
}

function toFlowEdges(snapEdges: SnapEdge[]): Edge[] {
  return snapEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  }));
}

export const Route = createFileRoute('/topologies')({
  component: TopologiesPage,
});

function TopologiesPage() {
  // List & Edit state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Editor state
  const [topologyName, setTopologyName] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [edgeLabelValue, setEdgeLabelValue] = useState('');

  const {
    data: topologies = [],
    isLoading,
    isFetching,
  } = useTopologiesQuery({ search: debouncedSearch });
  const isSearching = search !== debouncedSearch || isFetching;
  const saveMutation = useSaveTopologyMutation();
  const deleteMutation = useDeleteTopologyMutation();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setEdgeLabelValue((edge.label as string) || '');
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
    setEdgeLabelValue('');
  }, []);

  const handleAddNode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNodeLabel.trim()) return;
    const id = crypto.randomUUID();
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'default',
        position: {
          x: (nds.length % 4) * 200,
          y: Math.floor(nds.length / 4) * 120,
        },
        data: { label: newNodeLabel.trim() },
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '10px 14px',
          fontSize: '0.8125rem',
          fontWeight: '600',
        },
        className: 'border-border',
      },
    ]);
    setNewNodeLabel('');
  };

  const handleStartEdit = (t: SharedTopology) => {
    setEditingId(t.id);
    setTopologyName(t.name);
    setNodes(toFlowNodes(t.snapshot.nodes));
    setEdges(toFlowEdges(t.snapshot.edges));
    setShowEditor(true);
  };

  const handleToggleEditor = () => {
    if (showEditor) {
      setNodes([]);
      setEdges([]);
      setTopologyName('');
      setEditingId(null);
      setSelectedEdgeId(null);
      setEdgeLabelValue('');
    }
    setShowEditor((v) => !v);
  };

  const handleSave = () => {
    if (!topologyName.trim() || nodes.length === 0) return;
    const snapNodes: SnapNode[] = nodes.map((n) => ({
      id: n.id,
      type: n.type ?? 'service',
      label: n.data.label,
      metadata: { position: n.position },
    }));
    const snapEdges: SnapEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label as string | undefined,
    }));
    saveMutation.mutate(
      {
        ...(editingId ? { id: editingId } : {}),
        name: topologyName.trim(),
        nodes: snapNodes,
        edges: snapEdges,
      },
      {
        onSuccess: () => {
          setNodes([]);
          setEdges([]);
          setTopologyName('');
          setEditingId(null);
          setShowEditor(false);
        },
      },
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 space-y-6">
      {/* Header */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              Topologies
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Design and configure service graph models.
            </CardDescription>
          </div>
          <Button
            variant={showEditor ? 'ghost' : 'default'}
            onClick={handleToggleEditor}
            className="flex items-center gap-1.5 font-semibold"
          >
            {showEditor ? (
              'Cancel'
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>New Topology</span>
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      <AnimatePresence initial={false}>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <TopologyEditor
              topologyName={topologyName}
              setTopologyName={setTopologyName}
              newNodeLabel={newNodeLabel}
              setNewNodeLabel={setNewNodeLabel}
              nodes={nodes}
              onNodesChange={onNodesChange}
              setNodes={setNodes}
              edges={edges}
              onEdgesChange={onEdgesChange}
              setEdges={setEdges}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              onPaneClick={onPaneClick}
              selectedEdgeId={selectedEdgeId}
              setSelectedEdgeId={setSelectedEdgeId}
              edgeLabelValue={edgeLabelValue}
              setEdgeLabelValue={setEdgeLabelValue}
              isSaving={saveMutation.isPending}
              onSave={handleSave}
              onCancel={handleToggleEditor}
              saveError={saveMutation.isError ? saveMutation.error.message : null}
              editingId={editingId}
              handleAddNode={handleAddNode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading topologies…</p>
      )}

      {!showEditor && (topologies.length > 0 || search !== '') && (
        <Card className="border-border bg-card shadow-sm mb-4">
          <CardHeader className="py-3 flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-md font-semibold text-foreground">
              Saved Topologies
            </CardTitle>
            <div className="relative w-full max-w-xs">
              <Input
                placeholder="Search topologies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      {!isLoading && topologies.length === 0 && !showEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[30vh] border border-dashed border-border rounded-xl p-8 text-center bg-muted/10"
        >
          <p className="text-lg font-semibold text-foreground">
            {search ? 'No matching topologies found' : 'No topologies yet'}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            {search
              ? 'Try adjusting your search keywords.'
              : 'Create a topology first to define components and event channels for your runs.'}
          </p>
        </motion.div>
      )}

      {topologies.length > 0 && !showEditor && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
          className={`transition-opacity duration-200 ${isSearching ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <TopologyList
            topologies={topologies}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onEdit={handleStartEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            toFlowNodes={toFlowNodes}
            toFlowEdges={toFlowEdges}
          />
        </motion.div>
      )}
    </main>
  );
}
