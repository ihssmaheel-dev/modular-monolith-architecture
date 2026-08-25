const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generateFrontend({
  webPath,
  feature,
  Feature,
  featurePlural,
  FeaturePlural,
}) {
  const hooksContent = `import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Create${Feature}Dto, PaginationQuery } from "@repo/contracts";

export const ${featurePlural}Keys = {
  all: ["${featurePlural}"] as const,
  lists: () => [...${featurePlural}Keys.all, "list"] as const,
  list: (query?: PaginationQuery) => [...${featurePlural}Keys.lists(), query] as const,
  details: () => [...${featurePlural}Keys.all, "detail"] as const,
  detail: (id: string) => [...${featurePlural}Keys.details(), id] as const,
};

export function use${FeaturePlural}(query?: PaginationQuery) {
  return useQuery({
    queryKey: ${featurePlural}Keys.list(query),
    queryFn: async () => {
      const res = await (api as unknown as { ${featurePlural}: { list: (q: { query?: PaginationQuery }) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.list({ query });
      if (res.status >= 400) throw new Error("Failed to fetch ${featurePlural}");
      return res.body;
    },
  });
}

export function useCreate${Feature}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: Create${Feature}Dto) => {
      const res = await (api as unknown as { ${featurePlural}: { create: (r: { body: Create${Feature}Dto }) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.create({ body: dto });
      if (res.status >= 400) throw new Error("Failed to create ${feature}");
      return res.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${featurePlural}Keys.lists() });
    },
  });
}

export function useDelete${Feature}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await (api as unknown as { ${featurePlural}: { delete: (r: { params: { id: string } }) => Promise<{ status: number }> } }).${featurePlural}.delete({ params: { id } });
      if (res.status >= 400) throw new Error("Failed to delete ${feature}");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${featurePlural}Keys.lists() });
    },
  });
}
`;

  const formContent = `import { useState } from "react";
import { Button, Card, Input } from "@repo/ui";
import { useCreate${Feature} } from "../../../hooks/use-${featurePlural}";

export function Create${Feature}Form() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreate${Feature}();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createMutation.mutateAsync({ name, description: description || undefined });
    setName("");
    setDescription("");
  };

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Create ${Feature}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="${feature}-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </label>
          <Input
            id="${feature}-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter ${feature} name..."
            required
          />
        </div>
        <div>
          <label htmlFor="${feature}-desc" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <Input
            id="${feature}-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
          />
        </div>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create ${Feature}"}
        </Button>
      </form>
    </Card>
  );
}
`;

  const listContent = `import { Button, Card } from "@repo/ui";
import { use${FeaturePlural}, useDelete${Feature} } from "../../../hooks/use-${featurePlural}";
import type { ${Feature}ResponseDto } from "@repo/contracts";

export function ${FeaturePlural}List() {
  const { data, isLoading, isError } = use${FeaturePlural}();
  const deleteMutation = useDelete${Feature}();

  if (isLoading) return <div className="text-sm text-zinc-500">Loading ${featurePlural}...</div>;
  if (isError) return <div className="text-sm text-red-500">Failed to load ${featurePlural}.</div>;

  const items = (data as { items?: ${Feature}ResponseDto[] })?.items ?? [];

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-sm text-zinc-500">No ${featurePlural} found. Create one above!</div>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</div>
              {item.description && <div className="text-sm text-zinc-500">{item.description}</div>}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(item.id)}
            >
              Delete
            </Button>
          </Card>
        ))
      )}
    </div>
  );
}
`;

  writeFileIfMissing(
    path.join(webPath, "src", "hooks", `use-${featurePlural}.ts`),
    hooksContent,
  );
  writeFileIfMissing(
    path.join(webPath, "src", "components", "features", featurePlural, `Create${Feature}Form.tsx`),
    formContent,
  );
  writeFileIfMissing(
    path.join(webPath, "src", "components", "features", featurePlural, `${FeaturePlural}List.tsx`),
    listContent,
  );
}

module.exports = { generateFrontend };
