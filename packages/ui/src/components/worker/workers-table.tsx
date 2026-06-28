import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../data-table/index';
import { Badge } from '../ui/badge';

export interface Worker {
  id: string;
  workerId: string;
  name: string;
  version: string;
  state:
    | 'idle'
    | 'subscribing'
    | 'receiving'
    | 'validating'
    | 'executing'
    | 'publishing'
    | 'acking'
    | 'error';
  tags: string[];
  createdAt: string;
}

const STATE_CLASSES: Record<Worker['state'], string> = {
  idle: 'text-muted-foreground border-border',
  subscribing: 'text-blue-500 border-blue-500/30 bg-blue-500/5',
  receiving: 'text-cyan-500 border-cyan-500/30 bg-cyan-500/5',
  validating: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  executing: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/5 animate-pulse',
  publishing: 'text-purple-500 border-purple-500/30 bg-purple-500/5',
  acking: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
  error: 'text-rose-500 border-rose-500/30 bg-rose-500/5',
};

export const columns: ColumnDef<Worker>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-semibold text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => <span className="text-muted-foreground">v{row.original.version}</span>,
  },
  {
    accessorKey: 'workerId',
    header: 'Worker ID',
    cell: ({ row }) => (
      <code className="text-xs font-mono text-indigo-400 dark:text-indigo-300">
        {row.original.workerId}
      </code>
    ),
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => (
      <div className="flex gap-1.5 flex-wrap">
        {row.original.tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-xs px-1.5 py-0.5 rounded border border-border text-foreground bg-muted/30"
          >
            {tag}
          </Badge>
        ))}
        {row.original.tags.length === 0 && <span className="text-muted-foreground text-xs">-</span>}
      </div>
    ),
  },
  {
    accessorKey: 'state',
    header: 'State',
    cell: ({ row }) => {
      const state = row.original.state;
      return (
        <Badge
          variant={
            state === 'executing' ? 'default' : state === 'error' ? 'destructive' : 'outline'
          }
          className={`text-xs font-semibold px-2.5 py-0.5 capitalize ${STATE_CLASSES[state]}`}
        >
          {state}
        </Badge>
      );
    },
  },
];

export interface WorkersTableProps {
  workers: Worker[];
  isLoading: boolean;
}

export function WorkersTable({ workers, isLoading }: WorkersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={workers}
      isLoading={isLoading}
      emptyMessage="No workers registered. Workers appear here when they connect to the event bus."
    />
  );
}
