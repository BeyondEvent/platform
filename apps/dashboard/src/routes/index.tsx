import {
  useCreateSimulationMutation,
  useDeleteSimulationMutation,
  useSimulationsQuery,
  useTopologiesQuery,
} from '@/lib/queries';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@beyondevent/ui';
import { Link, createFileRoute } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

interface Simulation {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  topologyId: string | null;
  createdAt: string;
}

const STATUS_CLASSES: Record<Simulation['status'], string> = {
  pending: 'text-amber-500 border-amber-500/30 bg-amber-500/5',
  running: 'text-blue-500 border-blue-500/30 bg-blue-500/5 animate-pulse',
  paused: 'text-muted-foreground border-border bg-muted/10',
  completed: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5',
  failed: 'text-rose-500 border-rose-500/30 bg-rose-500/5',
};

import { AnimatePresence, motion } from 'motion/react';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [topologyId, setTopologyId] = useState('');

  const { data: simulations = [], isLoading, error } = useSimulationsQuery();
  const { data: topologies = [] } = useTopologiesQuery({ enabled: showForm });
  const createMutation = useCreateSimulationMutation();
  const deleteMutation = useDeleteSimulationMutation();

  const columns: ColumnDef<Simulation>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Link
          to="/simulations/$id"
          params={{ id: row.original.id }}
          className="font-semibold text-foreground hover:text-indigo-400 hover:underline transition-colors"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'topologyId',
      header: 'Topology',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.topologyId ? 'Has Linked Topology' : 'None'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'running' ? 'default' : status === 'failed' ? 'destructive' : 'outline'
            }
            className={`text-xs font-semibold px-2.5 py-0.5 capitalize ${STATUS_CLASSES[status]}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Link
            to="/simulations/$id"
            params={{ id: row.original.id }}
            className="group text-xs font-semibold text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={() => deleteMutation.mutate(row.original.id)}
            disabled={deleteMutation.isPending}
            className="text-rose-500 hover:text-rose-400 transition-colors disabled:opacity-40 cursor-pointer"
            title="Delete simulation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(
      {
        name: name.trim(),
        ...(topologyId !== '' ? { topologyId } : {}),
      },
      {
        onSuccess: () => {
          setName('');
          setTopologyId('');
          setShowForm(false);
        },
      },
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 space-y-6">
      {/* Header */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 flex-wrap gap-4">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              Simulations
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage, run and replay distributed event workflows.
            </CardDescription>
          </div>
          <Button
            variant={showForm ? 'ghost' : 'default'}
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 font-semibold"
          >
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>New Simulation</span>
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <Card className="bg-card border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-md font-semibold text-foreground">
                  Start New Simulation Run
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="sim-name-input"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      Simulation Name
                    </label>
                    <Input
                      id="sim-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Black Friday Load Test"
                      className="bg-background border-border text-foreground"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="topology-select-trigger"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      Linked Topology
                    </label>
                    <div className="flex gap-3 items-center">
                      <Select
                        value={topologyId || 'none'}
                        onValueChange={(val) => setTopologyId(val === 'none' ? '' : val)}
                      >
                        <SelectTrigger
                          id="topology-select-trigger"
                          className="flex-1 bg-background border-border text-foreground"
                        >
                          <SelectValue placeholder="No topology (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border text-foreground">
                          <SelectItem value="none">No topology (optional)</SelectItem>
                          {topologies.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link
                        to="/topologies"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors shrink-0"
                      >
                        + New Topology
                      </Link>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
                      {createMutation.isPending ? 'Creating…' : 'Create Simulation'}
                    </Button>
                  </div>
                  {createMutation.isError && (
                    <p className="text-xs text-rose-500 font-medium">
                      {String(createMutation.error)}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
      >
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            <DataTable
              columns={columns}
              data={simulations}
              isLoading={isLoading}
              error={error instanceof Error ? error.message : null}
              emptyMessage="No simulations yet. Create a topology and run a simulation to visualise event flow here."
            />
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
