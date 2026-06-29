import { Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface ChaosConfig {
  enabled: boolean;
  faultRate: number;
  latencyMs: number;
  errorMessage: string;
  duplicateRate: number;
}

export interface SimulationChaosPanelProps {
  simulationId: string;
  config: ChaosConfig;
  isPending: boolean;
  onSave: (cfg: Partial<ChaosConfig>) => void;
}

export function SimulationChaosPanel({ config, isPending, onSave }: SimulationChaosPanelProps) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [faultRate, setFaultRate] = useState(String(config.faultRate));
  const [latencyMs, setLatencyMs] = useState(String(config.latencyMs));
  const [errorMessage, setErrorMessage] = useState(config.errorMessage);
  const [duplicateRate, setDuplicateRate] = useState(String(config.duplicateRate));

  const isDirty =
    enabled !== config.enabled ||
    faultRate !== String(config.faultRate) ||
    latencyMs !== String(config.latencyMs) ||
    errorMessage !== config.errorMessage ||
    duplicateRate !== String(config.duplicateRate);

  function handleSave() {
    onSave({
      enabled,
      faultRate: Math.min(1, Math.max(0, Number(faultRate) || 0)),
      latencyMs: Math.max(0, Math.floor(Number(latencyMs) || 0)),
      errorMessage,
      duplicateRate: Math.min(1, Math.max(0, Number(duplicateRate) || 0)),
    });
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3 space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-md font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Chaos Engineering
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Inject faults and latency into simulation events to test resilience.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <span
            className={`text-xs font-semibold ${enabled ? 'text-yellow-500' : 'text-muted-foreground'}`}
          >
            {enabled ? 'ACTIVE' : 'OFF'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Toggle chaos engineering"
            onClick={() => setEnabled((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              enabled ? 'bg-yellow-500' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
                enabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="chaos-fault-rate">Fault Rate (0–1)</Label>
            <Input
              id="chaos-fault-rate"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={faultRate}
              onChange={(e) => setFaultRate(e.target.value)}
              className="bg-background border-border font-mono"
              disabled={!enabled}
            />
            <p className="text-[10px] text-muted-foreground">
              Probability a fault event replaces each published event.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chaos-latency">Latency (ms)</Label>
            <Input
              id="chaos-latency"
              type="number"
              min="0"
              step="100"
              value={latencyMs}
              onChange={(e) => setLatencyMs(e.target.value)}
              className="bg-background border-border font-mono"
              disabled={!enabled}
            />
            <p className="text-[10px] text-muted-foreground">
              Artificial delay injected before each event is published.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="chaos-duplicate-rate">Duplicate Rate (0–1)</Label>
            <Input
              id="chaos-duplicate-rate"
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={duplicateRate}
              onChange={(e) => setDuplicateRate(e.target.value)}
              className="bg-background border-border font-mono"
              disabled={!enabled}
            />
            <p className="text-[10px] text-muted-foreground">
              Probability each event is published twice (duplicate detection test).
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="chaos-error-message">Error Message</Label>
          <Input
            id="chaos-error-message"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            className="bg-background border-border"
            disabled={!enabled}
          />
        </div>

        {isDirty && (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Chaos Config'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
