import { socket } from '@/lib/socket';
import { useAppStore } from '@/store/app-store';
import { useEffect } from 'react';

export function useSocketConnection() {
  const isConnected = useAppStore((s) => s.isConnected);
  const setIsConnected = useAppStore((s) => s.setIsConnected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Reflect current state if socket connected before mount
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [setIsConnected]);

  return isConnected;
}
