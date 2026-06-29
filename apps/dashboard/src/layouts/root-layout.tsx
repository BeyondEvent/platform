import { Footer } from '@/components/footer';
import { Sidebar } from '@/components/sidebar';
import { useSocketConnection } from '@/hooks/use-socket-connection';
import { useTheme } from '@/providers/theme-provider';
import { InteractiveGridPattern } from '@beyondevent/ui';
import type { ReactNode } from 'react';

export function RootLayout({ children }: { readonly children: ReactNode }) {
  const isConnected = useSocketConnection();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex font-sans transition-colors duration-200 overflow-x-hidden">
      {/* Interactive Grid Background */}
      <InteractiveGridPattern
        className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 stroke-border/40"
        squaresClassName="hover:fill-indigo-500/10 transition-colors"
        width={40}
        height={40}
      />

      {/* Soft Vignette Mask */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at center, transparent 30%, var(--background) 90%)',
        }}
      />

      {/* Sidebar navigation */}
      <Sidebar isConnected={isConnected} theme={theme} toggleTheme={toggleTheme} />

      {/* Content layout wrapper */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen relative z-10">
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
