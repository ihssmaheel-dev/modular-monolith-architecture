import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await api.users.list({ query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT } });
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">Error loading users</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="space-y-2">
        {data?.users.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
