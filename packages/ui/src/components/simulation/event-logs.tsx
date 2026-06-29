import { RefreshCw, RotateCcw, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { memo, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { useSimulation } from './context';

const SimulationEventLogsComponent = () => {
  const {
    persistedEvents,
    mostRecentEvent,
    expandedEventId,
    setExpandedEventId,
    replayEventMutation,
    refetchEvents,
  } = useSimulation();

  const [traceFilter, setTraceFilter] = useState('');

  const filteredEvents = traceFilter.trim()
    ? persistedEvents.filter(
        (e) =>
          e.traceId?.includes(traceFilter.trim()) ||
          e.correlationId?.includes(traceFilter.trim()) ||
          e.type?.includes(traceFilter.trim()),
      )
    : persistedEvents;

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-md font-semibold text-foreground">
            Execution Events Log
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Real-time transaction stream and distributed tracing metrics. Click a row to inspect
            payloads.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={traceFilter}
              onChange={(e) => setTraceFilter(e.target.value)}
              placeholder="Filter by trace / type…"
              className="pl-8 pr-7 h-8 text-xs w-48 bg-background border-border"
            />
            {traceFilter && (
              <button
                type="button"
                onClick={() => setTraceFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetchEvents()}
            className="flex items-center gap-1.5 font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Logs</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">
            {traceFilter
              ? 'No events match the filter.'
              : 'No events persisted yet. Events appear in this stream as they propagate.'}
          </p>
        ) : (
          <ScrollArea className="h-80 border border-border rounded-lg p-2.5 bg-muted/10">
            <ul className="space-y-1.5">
              {filteredEvents.map((e) => {
                const isExpanded = expandedEventId === e.id;
                const isActive = mostRecentEvent?.id === e.id;
                return (
                  <li
                    key={e.id}
                    className={`border-b border-border last:border-b-0 py-2.5 px-3 rounded transition-all duration-200 cursor-pointer group outline-none focus-visible:bg-muted/20 ${
                      isActive ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500 font-medium' : ''
                    } ${
                      isExpanded
                        ? 'bg-muted/80 border-l-2 border-l-purple-500'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setExpandedEventId(isExpanded ? null : e.id)}
                    onKeyDown={(evt) => {
                      if (evt.key === 'Enter' || evt.key === ' ') {
                        evt.preventDefault();
                        setExpandedEventId(isExpanded ? null : e.id);
                      }
                    }}
                  >
                    <div className="text-xs font-mono flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-muted-foreground tabular-nums shrink-0 select-none">
                          {new Date(e.occurredAt).toLocaleTimeString()}
                        </span>
                        <span className="font-semibold text-foreground truncate">{e.type}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-muted-foreground text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono select-none">
                          Trace: {(e.traceId ?? '').slice(0, 8) || '—'}
                        </span>
                        <button
                          type="button"
                          onClick={(evt) => {
                            evt.stopPropagation();
                            replayEventMutation.mutate(e.id);
                          }}
                          disabled={replayEventMutation.isPending}
                          className="text-xs px-2.5 py-1 rounded border border-border hover:border-muted-foreground/30 bg-background hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-40 inline-flex items-center gap-1 font-semibold"
                          title="Replay Event"
                        >
                          <RotateCcw
                            className={`h-3 w-3 ${replayEventMutation.isPending ? 'animate-spin' : ''}`}
                          />
                          <span>Replay</span>
                        </button>
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div
                            role="presentation"
                            className="mt-2.5 bg-background border border-border rounded-lg p-3 font-mono text-[11px] text-foreground leading-relaxed shadow-inner overflow-x-auto"
                            onClick={(evt) => evt.stopPropagation()}
                            onKeyDown={(evt) => evt.stopPropagation()}
                          >
                            <div className="flex justify-between text-muted-foreground border-b border-border pb-1.5 mb-2 font-sans text-[10px] font-semibold uppercase tracking-wider">
                              <span>Event Payload Data</span>
                              <span className="font-mono">{e.id}</span>
                            </div>
                            <pre className="text-emerald-500 dark:text-emerald-400">
                              {JSON.stringify(e.payload, null, 2)}
                            </pre>
                            <div className="flex justify-between text-muted-foreground border-b border-border pb-1.5 mt-3 mb-2 font-sans text-[10px] font-semibold uppercase tracking-wider">
                              <span>Trace Correlation Context</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground font-mono text-[10px]">
                              <div>
                                <span className="text-muted-foreground/70">Trace ID:</span>{' '}
                                {e.traceId}
                              </div>
                              <div>
                                <span className="text-muted-foreground/70">Span ID:</span>{' '}
                                {e.spanId}
                              </div>
                              <div>
                                <span className="text-muted-foreground/70">Causation ID:</span>{' '}
                                {e.causationId || 'null (Root Event)'}
                              </div>
                              <div>
                                <span className="text-muted-foreground/70">Correlation ID:</span>{' '}
                                {e.correlationId}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export const SimulationEventLogs = memo(SimulationEventLogsComponent);
