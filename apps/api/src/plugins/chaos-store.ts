export interface ChaosConfig {
  enabled: boolean;
  faultRate: number;
  latencyMs: number;
  errorMessage: string;
  duplicateRate: number;
}

const DEFAULT: ChaosConfig = {
  enabled: false,
  faultRate: 0.2,
  latencyMs: 0,
  errorMessage: 'Chaos fault injected',
  duplicateRate: 0,
};

const store = new Map<string, ChaosConfig>();

export function getChaosConfig(simulationId: string): ChaosConfig {
  return store.get(simulationId) ?? { ...DEFAULT };
}

export type ChaosConfigUpdate = {
  enabled?: boolean | undefined;
  faultRate?: number | undefined;
  latencyMs?: number | undefined;
  errorMessage?: string | undefined;
  duplicateRate?: number | undefined;
};

export function setChaosConfig(simulationId: string, cfg: ChaosConfigUpdate): ChaosConfig {
  const next = { ...getChaosConfig(simulationId) };
  if (cfg.enabled !== undefined) next.enabled = cfg.enabled;
  if (cfg.faultRate !== undefined) next.faultRate = cfg.faultRate;
  if (cfg.latencyMs !== undefined) next.latencyMs = cfg.latencyMs;
  if (cfg.errorMessage !== undefined) next.errorMessage = cfg.errorMessage;
  if (cfg.duplicateRate !== undefined) next.duplicateRate = cfg.duplicateRate;
  store.set(simulationId, next);
  return next;
}

export function deleteChaosConfig(simulationId: string): void {
  store.delete(simulationId);
}
