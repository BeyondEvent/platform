import { Link } from '@tanstack/react-router';
import { Background, Controls, ReactFlow } from '@xyflow/react';
import { memo } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { type TopologyStub, useSimulation } from './context';

const SimulationTopologyMapComponent = () => {
  const {
    sim,
    topology,
    flowNodes,
    flowEdges,
    onNodeClick,
    onEdgeClick,
    topologySelectorOpen,
    setTopologySelectorOpen,
    pendingTopologyId,
    setPendingTopologyId,
    allTopologies,
    linkTopologyMutation,
  } = useSimulation();

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 space-y-0">
        <CardTitle className="text-md font-semibold text-foreground">
          Topology Map{topology ? `: ${topology.name}` : ''}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPendingTopologyId(sim.topologyId ?? '');
            setTopologySelectorOpen(!topologySelectorOpen);
          }}
        >
          {topologySelectorOpen ? 'Cancel' : 'Change Topology'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {topologySelectorOpen && (
          <div className="flex gap-3 items-center bg-muted border border-border p-3 rounded-lg">
            <Select
              value={pendingTopologyId || 'none'}
              onValueChange={(val) => setPendingTopologyId(val === 'none' ? '' : val)}
            >
              <SelectTrigger className="flex-1 bg-background border-border text-foreground">
                <SelectValue placeholder="No topology linked" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border text-foreground">
                <SelectItem value="none">No topology linked</SelectItem>
                {allTopologies.map((t: TopologyStub) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() =>
                linkTopologyMutation.mutate(pendingTopologyId !== '' ? pendingTopologyId : null)
              }
              disabled={linkTopologyMutation.isPending}
            >
              {linkTopologyMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
            {allTopologies.length === 0 && (
              <Link
                to="/topologies"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                + Create Topology
              </Link>
            )}
          </div>
        )}

        {topology ? (
          <div className="h-80 border border-border rounded-lg overflow-hidden bg-muted/20 relative">
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
            >
              <Background color="#27272a" gap={16} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        ) : (
          !topologySelectorOpen && (
            <p className="text-sm text-muted-foreground italic py-4">
              No topology linked. Use "Change Topology" above or{' '}
              <Link
                to="/topologies"
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                create one
              </Link>
              .
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export const SimulationTopologyMap = memo(SimulationTopologyMapComponent);
