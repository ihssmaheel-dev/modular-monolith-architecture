import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await api.users.list({ query: { page: 1, limit: 10 } });
      return result.body;
    },
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
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
