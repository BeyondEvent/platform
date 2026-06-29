import { useDeleteWorkerMutation, useWorkersQuery } from '@/lib/queries';
import { Card, CardDescription, CardHeader, CardTitle, WorkersTable } from '@beyondevent/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/workers')({
  component: WorkersPage,
});

function WorkersPage() {
  const { data: workers = [], isLoading } = useWorkersQuery();
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

      <section>
        <WorkersTable
          workers={workers}
          isLoading={isLoading}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </section>
    </main>
  );
}
