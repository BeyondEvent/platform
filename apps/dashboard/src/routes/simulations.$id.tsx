import type { Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { socket } from '../lib/socket';

import {
  useChaosConfigQuery,
  useLinkTopologyMutation,
  useMetricsSummaryQuery,
  useRenameSimulationMutation,
  useReplayEventMutation,
  useReplaySimulationMutation,
  useSimulationEventsQuery,
  useSimulationQuery,
  useTopologiesQuery,
  useTopologyQuery,
  useUpdateChaosMutation,
  useUpdateSimulationStatusMutation,
} from '@/lib/queries';
import {
  SimulationChaosPanel,
  SimulationContext,
  SimulationEventLogs,
  SimulationHeader,
  SimulationTopologyMap,
} from '@beyondevent/ui';
import type { PersistedEvent, SnapEdge, SnapNode, Topology } from '@beyondevent/ui';

type FlowNode = Node<{ label: string }>;

function toFlowNodes(
  snapNodes: SnapNode[],
  activeNodeIds: string[],
  expandedNodeIds: string[],
): FlowNode[] {
  return snapNodes.map((n) => {
    const isRunning = activeNodeIds.includes(n.id);
    const isSelected = expandedNodeIds.includes(n.id);
    const isActive = isRunning || isSelected;

    const metaPos = n.metadata?.position as { x: number; y: number } | undefined;
    const x = metaPos?.x ?? 0;
    const y = metaPos?.y ?? 0;

    return {
      id: n.id,
      position: { x, y },
      data: { label: n.label },
      style: isActive
        ? {
            background: '#1e1b4b',
            border: isSelected ? '2.5px solid #818cf8' : '2px solid #818cf8',
            color: '#e0e7ff',
            boxShadow: isSelected
              ? '0 0 16px rgba(129, 140, 248, 0.4)'
              : '0 0 10px rgba(129, 140, 248, 0.2)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          }
        : {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1.5px solid var(--border)',
            fontWeight: '600',
            transition: 'all 0.3s ease',
          },
      className: isActive ? 'node-running-pulse' : 'border-border',
    };
  });
}

function toFlowEdges(
  snapEdges: SnapEdge[],
  activeSourceId?: string,
  activeTargetId?: string,
  expandedSourceId?: string,
  expandedTargetId?: string,
): Edge[] {
  return snapEdges.map((e) => {
    const isPropagating = activeSourceId === e.source && activeTargetId === e.target;
    const isSelected = expandedSourceId === e.source && expandedTargetId === e.target;
    const isActive = isPropagating || isSelected;
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      animated: isPropagating,
      selected: isSelected,
      label: e.label,
      style: isActive
        ? { stroke: '#818cf8', strokeWidth: isSelected ? 3 : 2.5, transition: 'all 0.3s ease' }
        : { stroke: 'var(--border)', strokeWidth: 1.5, transition: 'all 0.3s ease' },
    };
  });
}

export const Route = createFileRoute('/simulations/$id')({
  component: SimulationDetailPage,
});

function SimulationDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [pendingTopologyId, setPendingTopologyId] = useState<string>('');
  const [topologySelectorOpen, setTopologySelectorOpen] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const { data: sim, isLoading } = useSimulationQuery(id);
  const { data: topology } = useTopologyQuery(sim?.topologyId);
  const { data: allTopologies = [] } = useTopologiesQuery({ enabled: topologySelectorOpen });
  const { data: persistedEvents = [], refetch: refetchEvents } = useSimulationEventsQuery(id);
  const { data: chaosConfig } = useChaosConfigQuery(id);
  const updateChaosMutation = useUpdateChaosMutation(id);
  const { data: metrics } = useMetricsSummaryQuery();

  useEffect(() => {
    socket.emit('simulation:join', id);

    function onSimulationEvent(event: PersistedEvent) {
      qc.setQueryData<PersistedEvent[]>(['events', id], (prev = []) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [event, ...prev];
      });
      void qc.invalidateQueries({ queryKey: ['simulation', id] });
    }

    // Re-join the room after reconnect (handles API restart or startup race)
    function onReconnect() {
      socket.emit('simulation:join', id);
    }

    socket.on('simulation:event', onSimulationEvent);
    socket.on('connect', onReconnect);

    return () => {
      socket.emit('simulation:leave', id);
      socket.off('simulation:event', onSimulationEvent);
      socket.off('connect', onReconnect);
    };
  }, [id, qc]);

  const statusMutation = useUpdateSimulationStatusMutation(id);
  const renameMutation = useRenameSimulationMutation(id);
  const linkTopologyMutation = useLinkTopologyMutation(id);
  const replayEventMutation = useReplayEventMutation(refetchEvents);
  const replaySimMutation = useReplaySimulationMutation(id, refetchEvents);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const matchingEvent = [...persistedEvents].reverse().find((e) => {
        if (!e.payload || typeof e.payload !== 'object') return false;
        const source = e.payload.source;
        const target = e.payload.target;
        return (
          source === node.id ||
          source === (node.data as { label: string }).label ||
          target === node.id ||
          target === (node.data as { label: string }).label
        );
      });
      if (matchingEvent) setExpandedEventId(matchingEvent.id);
    },
    [persistedEvents],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const matchingEvent = [...persistedEvents].reverse().find((e) => {
        if (!e.payload || typeof e.payload !== 'object') return false;
        const source = e.payload.source;
        const target = e.payload.target;
        const sourceMatches =
          source === edge.source ||
          source === topology?.snapshot.nodes.find((n) => n.id === edge.source)?.label;
        const targetMatches =
          target === edge.target ||
          target === topology?.snapshot.nodes.find((n) => n.id === edge.target)?.label;
        return sourceMatches && targetMatches;
      });
      if (matchingEvent) setExpandedEventId(matchingEvent.id);
    },
    [persistedEvents, topology],
  );

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!sim) return <p className="text-sm text-red-600">Simulation not found</p>;

  const isRunning = sim.status === 'running';

  const mostRecentEvent =
    isRunning && persistedEvents.length > 0
      ? persistedEvents.reduce((prev, curr) =>
          new Date(curr.occurredAt).getTime() > new Date(prev.occurredAt).getTime() ? curr : prev,
        )
      : null;

  const activeSourceNode =
    mostRecentEvent?.payload && typeof mostRecentEvent.payload === 'object'
      ? topology?.snapshot.nodes.find(
          (n) =>
            n.id === mostRecentEvent.payload.source || n.label === mostRecentEvent.payload.source,
        )
      : null;
  const activeTargetNode =
    mostRecentEvent?.payload && typeof mostRecentEvent.payload === 'object'
      ? topology?.snapshot.nodes.find(
          (n) =>
            n.id === mostRecentEvent.payload.target || n.label === mostRecentEvent.payload.target,
        )
      : null;

  const activeSourceId = activeSourceNode?.id;
  const activeTargetId = activeTargetNode?.id;
  const activeNodeIds = [activeSourceId, activeTargetId].filter(
    (nid): nid is string => nid != null,
  );

  const expandedEvent = persistedEvents.find((e) => e.id === expandedEventId);
  const expandedSourceNode =
    expandedEvent?.payload && typeof expandedEvent.payload === 'object'
      ? topology?.snapshot.nodes.find(
          (n) => n.id === expandedEvent.payload.source || n.label === expandedEvent.payload.source,
        )
      : null;
  const expandedTargetNode =
    expandedEvent?.payload && typeof expandedEvent.payload === 'object'
      ? topology?.snapshot.nodes.find(
          (n) => n.id === expandedEvent.payload.target || n.label === expandedEvent.payload.target,
        )
      : null;

  const expandedSourceId = expandedSourceNode?.id;
  const expandedTargetId = expandedTargetNode?.id;
  const expandedNodeIds = [expandedSourceId, expandedTargetId].filter(
    (nid): nid is string => nid != null,
  );

  const flowNodes = topology
    ? toFlowNodes(topology.snapshot.nodes, activeNodeIds, expandedNodeIds)
    : [];
  const flowEdges = topology
    ? toFlowEdges(
        topology.snapshot.edges,
        activeSourceId,
        activeTargetId,
        expandedSourceId,
        expandedTargetId,
      )
    : [];

  const contextValue = {
    sim,
    topology,
    persistedEvents,
    mostRecentEvent,
    expandedEventId,
    setExpandedEventId,
    activeSourceId,
    activeTargetId,
    activeNodeIds,
    expandedNodeIds,
    flowNodes,
    flowEdges,
    onNodeClick,
    onEdgeClick,
    replayEventMutation,
    replaySimMutation,
    statusMutation,
    renameMutation,
    refetchEvents,
    topologySelectorOpen,
    setTopologySelectorOpen,
    allTopologies,
    linkTopologyMutation,
    pendingTopologyId,
    setPendingTopologyId,
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      <main className="max-w-5xl mx-auto px-4 space-y-6">
        <header>
          <SimulationHeader />
        </header>
        <section>
          <SimulationTopologyMap />
        </section>
        <section>
          <SimulationEventLogs />
        </section>
        {chaosConfig !== undefined && (
          <section>
            <SimulationChaosPanel
              simulationId={id}
              config={chaosConfig}
              isPending={updateChaosMutation.isPending}
              onSave={(cfg) => updateChaosMutation.mutate(cfg)}
            />
          </section>
        )}
        {metrics !== undefined && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(
                [
                  { label: 'Total Events', value: metrics.totalEvents },
                  { label: 'Total Simulations', value: metrics.totalSimulations },
                  { label: 'Running', value: metrics.runningSimulations },
                  { label: 'Active Workers', value: metrics.activeWorkers },
                ] as { label: string; value: number }[]
              ).map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1 shadow-sm"
                >
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                  </span>
                  <span className="text-2xl font-extrabold text-foreground tabular-nums">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
              Broker:{' '}
              <span
                className={`font-semibold ${metrics.brokerConnected ? 'text-emerald-500' : 'text-rose-500'}`}
              >
                {metrics.brokerType} {metrics.brokerConnected ? '●' : '○'}
              </span>
            </p>
          </section>
        )}
      </main>
    </SimulationContext.Provider>
  );
}
