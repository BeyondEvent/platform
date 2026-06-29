import { Link } from '@tanstack/react-router';
import { CheckCircle2, Pause, Pencil, Play, RotateCcw, XCircle } from 'lucide-react';
import type * as React from 'react';
import { memo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSimulation } from './context';

const STATUS_CLASSES = {
  pending: 'bg-yellow-100/10 text-yellow-500 border border-yellow-500/20',
  running: 'bg-blue-100/10 text-blue-500 border border-blue-500/20 animate-pulse',
  paused: 'bg-gray-100/10 text-gray-500 border border-gray-500/20',
  completed: 'bg-green-100/10 text-green-500 border border-green-500/20',
  failed: 'bg-red-100/10 text-red-500 border border-red-500/20',
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['running'],
  running: ['paused', 'completed', 'failed'],
  paused: ['running', 'completed'],
  completed: [],
  failed: [],
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <Play className="h-3 w-3 mr-1" />,
  paused: <Pause className="h-3 w-3 mr-1" />,
  completed: <CheckCircle2 className="h-3 w-3 mr-1" />,
  failed: <XCircle className="h-3 w-3 mr-1" />,
};

const SimulationHeaderComponent = () => {
  const { sim, replaySimMutation, statusMutation, renameMutation } = useSimulation();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

  const nextStatuses = STATUS_TRANSITIONS[sim.status] ?? [];

  return (
    <div className="flex items-center justify-between border-b border-border pb-5 flex-wrap gap-4">
      <div className="min-w-0">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-400 font-semibold transition-colors mb-1.5"
        >
          ← Back to Simulations
        </Link>
        {isEditingName ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingNameValue.trim()) {
                renameMutation.mutate(editingNameValue.trim(), {
                  onSuccess: () => setIsEditingName(false),
                });
              }
            }}
            className="flex items-center gap-2 mt-1"
          >
            <Input
              type="text"
              value={editingNameValue}
              onChange={(e) => setEditingNameValue(e.target.value)}
              autoFocus
              className="w-60"
            />
            <Button type="submit" size="sm" disabled={renameMutation.isPending}>
              {renameMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingName(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground truncate flex items-center gap-2 group">
            {sim.name}
            <button
              type="button"
              onClick={() => {
                setEditingNameValue(sim.name);
                setIsEditingName(true);
              }}
              className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer pl-1 font-semibold select-none"
            >
              <Pencil className="h-3 w-3" />
              <span>Edit Name</span>
            </button>
          </h1>
        )}
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Created: {new Date(sim.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_CLASSES[sim.status] ?? ''}`}
        >
          {sim.status}
        </span>
        <div className="flex items-center gap-2">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              variant="secondary"
              size="sm"
              onClick={() => statusMutation.mutate(s)}
              disabled={statusMutation.isPending}
              className="capitalize flex items-center"
            >
              {STATUS_ICONS[s]}
              <span>{s}</span>
            </Button>
          ))}
          <Button
            size="sm"
            onClick={() => replaySimMutation.mutate()}
            disabled={replaySimMutation.isPending || sim.status === 'running'}
            className="flex items-center gap-1.5 font-semibold"
          >
            <RotateCcw
              className={`h-3.5 w-3.5 ${replaySimMutation.isPending ? 'animate-spin' : ''}`}
            />
            <span>Replay All</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SimulationHeader = memo(SimulationHeaderComponent);
