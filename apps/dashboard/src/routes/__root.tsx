import { RootLayout } from '@/layouts/root-layout';
import { socket } from '@/lib/socket';
import { ThemeProvider } from '@/providers/theme-provider';
import { useAppStore } from '@/store/app-store';
import { useEventStore } from '@/store/event-store';
import type { LiveEvent } from '@/store/event-store';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const setIsConnected = useAppStore((s) => s.setIsConnected);
  const addEvent = useEventStore((s) => s.addEvent);

  useEffect(() => {
    socket.connect();
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('event:published', (event: LiveEvent) => addEvent(event));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('event:published');
      socket.disconnect();
    };
  }, [setIsConnected, addEvent]);

  return (
    <ThemeProvider>
      <RootLayout>
        <Outlet />
      </RootLayout>
    </ThemeProvider>
  );
}
