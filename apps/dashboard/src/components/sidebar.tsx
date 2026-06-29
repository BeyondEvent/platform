import { Button } from '@beyondevent/ui';
import { Link } from '@tanstack/react-router';
import { Activity, Cpu, Moon, Network, Sun } from 'lucide-react';

const MENU_ITEMS = [
  {
    to: '/',
    label: 'Simulations',
    icon: Activity,
  },
  {
    to: '/topologies',
    label: 'Topologies',
    icon: Network,
  },
  {
    to: '/workers',
    label: 'Workers',
    icon: Cpu,
  },
] as const;

interface SidebarProps {
  isConnected: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function Sidebar({ isConnected, theme, toggleTheme }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-30 border-r border-border bg-card/45 backdrop-blur-md flex flex-col p-6 pointer-events-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-bold tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-lg select-none">
          BeyondEvent
        </span>
      </div>

      {/* Navigation Stack */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-semibold px-4 py-3 rounded-none text-muted-foreground hover:text-foreground transition-all flex items-center gap-3 [&.active]:bg-background [&.active]:text-indigo-500 [&.active]:ring-1 [&.active]:ring-foreground/10 dark:[&.active]:bg-background/80"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Controls Section */}
      <div className="border-t border-border/40 pt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Theme
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-none hover:bg-muted/50 flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center justify-between border border-border/40 bg-muted/50 p-3 rounded-none select-none">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Status
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`h-1.5 w-1.5 rounded-none ${isConnected ? 'bg-emerald-500 animate-pulse shadow-md shadow-emerald-500/50' : 'bg-zinc-600'}`}
            />
            <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
