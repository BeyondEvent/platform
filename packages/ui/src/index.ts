// ── Utility ──────────────────────────────────────────────────────────
export { cn } from './lib/utils';

// ── shadcn/ui components ──────────────────────────────────────────────
export { Button, buttonVariants } from './components/ui/button';

export { Badge, badgeVariants } from './components/ui/badge';

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';

export { Separator } from './components/ui/separator';

export { Skeleton } from './components/ui/skeleton';

export { Input } from './components/ui/input';

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';

export { ScrollArea, ScrollBar } from './components/ui/scroll-area';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';

// ── Simulation components ─────────────────────────────────────────────
export { SimulationContext, useSimulation } from './components/simulation/context';
export type {
  Simulation,
  SimulationStatus,
  SimulationContextType,
  SnapNode,
  SnapEdge,
  Topology,
  TopologyStub,
  EventPayload,
  PersistedEvent,
} from './components/simulation/context';

export { SimulationHeader } from './components/simulation/header';
export { SimulationTopologyMap } from './components/simulation/topology-map';
export { SimulationEventLogs } from './components/simulation/event-logs';

// ── Topology components ───────────────────────────────────────────────
export { TopologyEditor } from './components/topology/topology-editor';
export type { TopologyEditorProps } from './components/topology/topology-editor';
export { TopologyList } from './components/topology/topology-list';
export type { TopologyListProps } from './components/topology/topology-list';
export type { Topology as SharedTopology } from './components/topology/types';

// ── Worker components ─────────────────────────────────────────────────
export { WorkersTable } from './components/worker/workers-table';
export type { WorkersTableProps, Worker } from './components/worker/workers-table';

// ── Legacy components ─────────────────────────────────────────────────
export { ErrorBoundary } from './components/error-boundary/index';
export type { ErrorBoundaryProps } from './components/error-boundary/index';

export { DataTable } from './components/data-table/index';
export type { DataTableProps } from './components/data-table/index';
