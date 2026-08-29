const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generateWeb({ feature, Feature, featurePlural, FeaturePlural }) {
  const rootPath = path.resolve(__dirname, "../..");
  const webFeatureDir = path.join(rootPath, "apps", "web", "src", "features", featurePlural);

  const queriesContent = `import { queryOptions } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'

export function ${featurePlural}ListQuery(page = 1, limit = 20) {
  return queryOptions({
    queryKey: ['${featurePlural}', 'list', { page, limit }] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { list: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.list({ query: { page, limit } } as never)
      if ((res as { status: number }).status !== 200) throw new Error('Failed to fetch ${featurePlural}')
      return (res as { body: unknown }).body
    },
  })
}

export function ${feature}ByIdQuery(id: string) {
  return queryOptions({
    queryKey: ['${featurePlural}', 'detail', id] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { getById: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.getById({ params: { id } } as never)
      if ((res as { status: number }).status !== 200) throw new Error('${Feature} not found')
      return (res as { body: unknown }).body
    },
    enabled: !!id,
  })
}
`;

  const mutationsContent = `import { mutationOptions } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import type { Create${Feature}Dto, Update${Feature}Dto } from '@repo/contracts'

export function create${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ['${featurePlural}', 'create'] as const,
    mutationFn: async (data: Create${Feature}Dto) => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { create: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.create({ body: data } as never)
      if (![200, 201].includes((res as { status: number }).status)) throw new Error('Failed to create ${feature}')
      return (res as { body: unknown }).body
    },
  })
}

export function update${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ['${featurePlural}', 'update'] as const,
    mutationFn: async ({ id, ...data }: Update${Feature}Dto & { id: string }) => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { update: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.update({ params: { id }, body: data } as never)
      if ((res as { status: number }).status !== 200) throw new Error('Failed to update ${feature}')
      return (res as { body: unknown }).body
    },
  })
}

export function delete${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ['${featurePlural}', 'delete'] as const,
    mutationFn: async (id: string) => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { delete: (q: unknown) => Promise<{ status: number }> } }).${featurePlural}.delete({ params: { id } } as never)
      if ((res as { status: number }).status !== 204) throw new Error('Failed to delete ${feature}')
    },
  })
}
`;

  const routeContent = `import { createFileRoute, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Create${Feature}Schema, PaginationQuerySchema, type Create${Feature}Dto } from '@repo/contracts'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { DataTable, type DataTableColumn, DataTablePagination } from '@repo/ui/components/composed/data-table'
import { PageHeader } from '@repo/ui/components/composed/page-header'
import { EmptyState } from '@repo/ui/components/composed/empty-state'
import { toast } from '@repo/ui/components/ui/toast'
import { useAuthStore } from '@/stores/auth.store'
import { getApiClient } from '@/lib/api'

export const Route = createFileRoute('/${featurePlural}')({
  validateSearch: PaginationQuerySchema,
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (!user) throw redirect({ to: '/auth' })
  },
  loaderDeps: ({ search }) => ({ page: search.page, limit: search.limit }),
  loader: async ({ deps, context }) => {
    const qc = context.queryClient
    await qc.ensureQueryData({
      queryKey: ['${featurePlural}', { page: deps.page, limit: deps.limit }],
      queryFn: async () => {
        const client = getApiClient()
        const res = await (client as unknown as { ${featurePlural}: { list: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.list({ query: { page: deps.page, limit: deps.limit } } as never)
        if ((res as { status: number }).status !== 200) throw new Error('Failed to fetch ${featurePlural}')
        return (res as { body: unknown }).body
      },
    })
  },
  component: ${FeaturePlural}Page,
})

function ${FeaturePlural}Page() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const qc = useQueryClient()
  const page = search.page ?? 1
  const limit = search.limit ?? 20

  const listQuery = useQuery({
    queryKey: ['${featurePlural}', { page, limit }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { list: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.list({ query: { page, limit } } as never)
      if ((res as { status: number }).status !== 200) throw new Error('Failed to fetch ${featurePlural}')
      return (res as { body: unknown }).body as { items: Array<{ id: string; title: string; content?: string; createdAt: string }>; total: number; totalPages: number }
    },
  })

  const form = useForm<Create${Feature}Dto>({
    resolver: zodResolver(Create${Feature}Schema as never),
    defaultValues: { title: '', content: '' } as unknown as Create${Feature}Dto,
  })

  const createMutation = useMutation({
    mutationFn: async (data: Create${Feature}Dto) => {
      const client = getApiClient()
      const res = await (client as unknown as { ${featurePlural}: { create: (q: unknown) => Promise<{ status: number; body: unknown }> } }).${featurePlural}.create({ body: data } as never)
      if (![200, 201].includes((res as { status: number }).status)) throw new Error('Create failed')
      return (res as { body: unknown }).body
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['${featurePlural}'] })
      form.reset()
      toast.add({ title: 'Created', type: 'success' } as never)
    },
  })

  const columns: DataTableColumn<{ id: string; title: string; content?: string; createdAt: string }>[] = [
    { key: 'title', header: 'Title', cell: (r) => r.title },
    { key: 'content', header: 'Content', cell: (r) => r.content ?? '—' },
    { key: 'createdAt', header: 'Created', cell: (r) => new Date(r.createdAt).toLocaleString(), className: 'hidden sm:table-cell' },
  ]

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="border-b bg-background">
        <div className="container mx-auto p-4">
          <PageHeader title="${FeaturePlural}" description={\`Manage your \${'${featurePlural}'} here.\`} />
        </div>
      </div>
      <div className="container mx-auto max-w-3xl p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create ${Feature}</CardTitle>
            <CardDescription>Powered by @repo/contracts + @repo/ui</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Title" {...form.register('title' as never)} />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea placeholder="Content" rows={3} {...form.register('content' as never)} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {listQuery.isLoading ? (
          <Card><CardContent className="p-6">Loading...</CardContent></Card>
        ) : listQuery.data?.items.length === 0 ? (
          <EmptyState title="No ${featurePlural} yet" description="Create one above" />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <DataTable data={listQuery.data?.items ?? []} columns={columns} getRowKey={(r) => r.id} />
              {listQuery.data && (listQuery.data as { totalPages: number }).totalPages > 1 && (
                <DataTablePagination page={page} totalPages={(listQuery.data as { totalPages: number }).totalPages} onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p }) })} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
`;

  writeFileIfMissing(path.join(webFeatureDir, `${feature}.queries.ts`), queriesContent);
  writeFileIfMissing(path.join(webFeatureDir, `${feature}.mutations.ts`), mutationsContent);
  writeFileIfMissing(path.join(rootPath, "apps", "web", "src", "routes", `${featurePlural}.tsx`), routeContent);
}

module.exports = { generateWeb };
