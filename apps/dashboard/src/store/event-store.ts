import { create } from 'zustand';

export interface LiveEvent {
  id: string;
  type: string;
  payload: unknown;
  traceContext: { traceId: string; spanId: string };
  occurredAt: number;
  version: number;
}

interface EventState {
  events: LiveEvent[];
  addEvent: (event: LiveEvent) => void;
  clear: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event) => set((s) => ({ events: [event, ...s.events].slice(0, 200) })),
  clear: () => set({ events: [] }),
}));
