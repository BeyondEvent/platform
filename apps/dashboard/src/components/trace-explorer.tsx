import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@beyondevent/ui';
import type { PersistedEvent } from '@beyondevent/ui';

interface TraceExplorerProps {
  events: PersistedEvent[];
}

export function TraceExplorer({ events }: TraceExplorerProps) {
  const byTrace = new Map<string, PersistedEvent[]>();
  for (const e of events) {
    const tid = e.traceId ?? 'unknown';
    const existing = byTrace.get(tid);
    if (existing) {
      existing.push(e);
    } else {
      byTrace.set(tid, [e]);
    }
  }

  const traces = [...byTrace.entries()].sort((a, b) => {
    const aFirst = Math.min(...a[1].map((e) => new Date(e.occurredAt).getTime()));
    const bFirst = Math.min(...b[1].map((e) => new Date(e.occurredAt).getTime()));
    return bFirst - aFirst;
  });

  if (traces.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        No traces yet — run a simulation to see trace causation chains here.
      </p>
    );
  }

  return (
    <Accordion type="multiple" className="space-y-1">
      {traces.map(([traceId, traceEvents]) => {
        const sorted = [...traceEvents].sort(
          (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
        );
        const hasFault = sorted.some((e) => e.type === 'chaos.fault.injected');
        const firstEvent = sorted[0];
        const lastEvent = sorted[sorted.length - 1];
        const firstTs = firstEvent ? new Date(firstEvent.occurredAt).getTime() : 0;
        const lastTs = lastEvent ? new Date(lastEvent.occurredAt).getTime() : 0;
        const durationMs = lastTs - firstTs;

        return (
          <AccordionItem
            key={traceId}
            value={traceId}
            className="border border-border rounded-lg px-3 bg-card"
          >
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-3 text-left w-full min-w-0 pr-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${hasFault ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  {traceId.slice(0, 16)}…
                </span>
                {hasFault && (
                  <span className="text-[10px] font-semibold text-red-400 shrink-0">FAULT</span>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto shrink-0 tabular-nums">
                  {sorted.length} span{sorted.length !== 1 ? 's' : ''}
                  {durationMs > 0 && ` · ${durationMs}ms`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              <div className="space-y-0 pl-1">
                {sorted.map((e, i) => {
                  const isFault = e.type === 'chaos.fault.injected';
                  return (
                    <div key={e.id} className="flex items-start gap-2 text-[11px] font-mono">
                      <div className="flex flex-col items-center shrink-0 pt-1">
                        <span
                          className={`h-2 w-2 rounded-full ${isFault ? 'bg-red-500' : 'bg-indigo-400'}`}
                        />
                        {i < sorted.length - 1 && (
                          <div className="w-px bg-border mt-0.5 mb-0.5 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 pb-1">
                        <span
                          className={`font-semibold ${isFault ? 'text-red-400' : 'text-foreground'}`}
                        >
                          {e.type}
                        </span>
                        {e.causationId && (
                          <span className="text-muted-foreground ml-2">
                            ← {e.causationId.slice(0, 8)}
                          </span>
                        )}
                        <span className="text-muted-foreground ml-2">
                          {new Date(e.occurredAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
