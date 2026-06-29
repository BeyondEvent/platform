import { Button, Slider } from '@beyondevent/ui';
import type { PersistedEvent } from '@beyondevent/ui';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SimulationTimelineProps {
  events: PersistedEvent[];
  onScrub: (visibleUpTo: number) => void;
}

export function SimulationTimeline({ events, onScrub }: SimulationTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );
  const firstEvent = sorted[0];
  const lastEvent = sorted[sorted.length - 1];
  const first = firstEvent ? new Date(firstEvent.occurredAt).getTime() : Date.now();
  const last = lastEvent ? new Date(lastEvent.occurredAt).getTime() : Date.now();
  const range = Math.max(last - first, 1);

  const [position, setPosition] = useState(100);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ts = first + (position / 100) * range;
    onScrub(ts);
  }, [position, first, range, onScrub]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPosition((p) => {
          if (p >= 100) {
            setPlaying(false);
            return 100;
          }
          return Math.min(100, p + 1);
        });
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const stepBack = () => {
    setPlaying(false);
    setPosition((p) => Math.max(0, p - 10));
  };
  const stepForward = () => {
    setPlaying(false);
    setPosition((p) => Math.min(100, p + 10));
  };

  const currentTs = first + (position / 100) * range;
  const visibleCount = sorted.filter((e) => new Date(e.occurredAt).getTime() <= currentTs).length;

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-4">
        No events to scrub yet — run a simulation first.
      </p>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Timeline Scrubber
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {visibleCount} / {events.length} events
        </span>
      </div>

      <Slider
        value={[position]}
        onValueChange={(vals) => {
          setPlaying(false);
          const v = vals[0];
          if (v !== undefined) setPosition(v);
        }}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={stepBack}>
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={stepForward}>
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
          <span>{new Date(first).toLocaleTimeString()}</span>
          <span className="text-foreground font-semibold">
            {new Date(currentTs).toLocaleTimeString()}
          </span>
          <span>{new Date(last).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="relative h-6 bg-muted/30 rounded overflow-hidden border border-border">
        {sorted.map((e) => {
          const pct = ((new Date(e.occurredAt).getTime() - first) / range) * 100;
          const isFault = e.type === 'chaos.fault.injected';
          return (
            <div
              key={e.id}
              className={`absolute top-1 w-1 h-4 rounded-sm ${isFault ? 'bg-red-500' : 'bg-indigo-500'} opacity-70`}
              style={{ left: `${pct}%` }}
              title={`${e.type} @ ${new Date(e.occurredAt).toLocaleTimeString()}`}
            />
          );
        })}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${position}%` }}
        />
      </div>
    </div>
  );
}
