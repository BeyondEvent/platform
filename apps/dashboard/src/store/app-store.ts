import { create } from 'zustand';

export interface AppState {
  readonly isConnected: boolean;
  readonly activeSimulationId: string | null;
  setIsConnected: (connected: boolean) => void;
  setActiveSimulationId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isConnected: false,
  activeSimulationId: null,
  setIsConnected: (connected) => set({ isConnected: connected }),
  setActiveSimulationId: (id) => set({ activeSimulationId: id }),
}));
