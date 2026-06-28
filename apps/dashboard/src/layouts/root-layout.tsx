import { socket } from '@/lib/socket';
import { useAppStore } from '@/store/app-store';
import { Button } from '@beyondevent/ui';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

export function RootLayout({ children }: { readonly children: ReactNode }) {
  const isConnected = useAppStore((s) => s.isConnected);
  const setIsConnected = useAppStore((s) => s.setIsConnected);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (saved) return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const changeTheme = () => {
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const doc = document as unknown as { startViewTransition: (cb: () => void) => void };
      doc.startViewTransition(changeTheme);
    } else {
      changeTheme();
    }
  };

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
    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [setIsConnected]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3.5 shadow-sm">
        <nav className="max-w-6xl mx-auto flex items-center gap-6">
          <span className="font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-lg select-none mr-2">
            BeyondEvent
          </span>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-indigo-400 [&.active]:font-semibold"
            >
              Simulations
            </Link>
            <Link
              to="/topologies"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-indigo-400 [&.active]:font-semibold"
            >
              Topologies
            </Link>
            <Link
              to="/workers"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors [&.active]:text-indigo-400 [&.active]:font-semibold"
            >
              Workers
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <div className="flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1 shadow-inner select-none">
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50' : 'bg-zinc-600'}`}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
