import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@repo/ui";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await (api.users.list as any)({ query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT } });
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
        Failed to load users. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage your users</p>
        </div>
        <Button>Add User</Button>
      </div>

      <div className="space-y-3">
        {data?.users.map((user: any) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/users")({
  component: UsersPage,
});
