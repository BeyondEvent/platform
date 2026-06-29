import { useDebounce } from '@/hooks/use-debounce';
import { useDeleteWorkerMutation, useWorkersQuery } from '@/lib/queries';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  WorkersTable,
} from '@beyondevent/ui';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/workers')({
  component: WorkersPage,
});

function WorkersPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: workers = [], isLoading, isFetching } = useWorkersQuery(debouncedSearch);
  const isSearching = search !== debouncedSearch || isFetching;
  const deleteMutation = useDeleteWorkerMutation();

  return (
    <main className="max-w-5xl mx-auto px-4 space-y-6">
      <Card className="border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            Workers
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Monitor currently registered compute instances.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-md font-semibold text-foreground">
            Registered Instances
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Input
              placeholder="Search workers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent
          className={`pt-4 transition-opacity duration-200 ${isSearching ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <WorkersTable
            workers={workers}
            isLoading={isLoading && workers.length === 0}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </CardContent>
      </Card>
    </main>
  );
}
