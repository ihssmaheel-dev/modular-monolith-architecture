const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generateWeb({ feature, Feature, featurePlural, FeaturePlural }) {
  const rootPath = path.resolve(__dirname, "../..");
  const webFeatureDir = path.join(rootPath, "apps", "web", "src", "features", featurePlural);

  const queriesContent = `import { queryOptions } from '@tanstack/react-query'
import { getApiClient } from '@/lib/api'
import { useTenantStore } from '@/stores/tenant.store'

export function ${featurePlural}ListQuery(page = 1, limit = 20) {
  const tenantId = useTenantStore.getState().tenantId
  return queryOptions({
    queryKey: ['${featurePlural}', tenantId, 'list', { page, limit }] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.${featurePlural}.list({ query: { page, limit } })
      if (res.status !== 200) throw new Error('errors.networkError')
      return res.body
    },
  })
}

export function ${feature}ByIdQuery(id: string) {
  const tenantId = useTenantStore.getState().tenantId
  return queryOptions({
    queryKey: ['${featurePlural}', tenantId, 'detail', id] as const,
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.${featurePlural}.getById({ params: { id } })
      if (res.status !== 200) throw new Error('errors.notFound')
      return res.body
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
      const res = await client.${featurePlural}.create({ body: data })
      if (![200, 201].includes(res.status)) throw new Error('errors.serverError')
      return res.body
    },
  })
}

export function update${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ['${featurePlural}', 'update'] as const,
    mutationFn: async ({ id, ...data }: Update${Feature}Dto & { id: string }) => {
      const client = getApiClient()
      const res = await client.${featurePlural}.update({ params: { id }, body: data })
      if (res.status !== 200) throw new Error('errors.serverError')
      return res.body
    },
  })
}

export function delete${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ['${featurePlural}', 'delete'] as const,
    mutationFn: async (id: string) => {
      const client = getApiClient()
      const res = await client.${featurePlural}.delete({ params: { id } })
      if (res.status !== 204) throw new Error('errors.serverError')
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
import { ${featurePlural}ListQuery } from '@/features/${featurePlural}/${feature}.queries'

export const Route = createFileRoute('/${featurePlural}')({
  validateSearch: PaginationQuerySchema,
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (!user) throw redirect({ to: '/auth' })
  },
  loaderDeps: ({ search }) => ({ page: search.page, limit: search.limit }),
  loader: async ({ deps, context }) => {
    const qc = context.queryClient
    await qc.ensureQueryData(${featurePlural}ListQuery(deps.page, deps.limit))
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
  const listQuery = useQuery(${featurePlural}ListQuery(page, limit))

  const form = useForm<Create${Feature}Dto>({
    resolver: zodResolver(Create${Feature}Schema),
    defaultValues: { name: '', description: '' },
  })

  const createMutation = useMutation({
    mutationFn: async (data: Create${Feature}Dto) => {
      const client = getApiClient()
      const res = await client.${featurePlural}.create({ body: data })
      if (![200, 201].includes(res.status)) throw new Error('errors.serverError')
      return res.body
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['${featurePlural}'] })
      form.reset()
      toast.add({ title: t('common.created'), type: 'success' } as never)
    },
  })

  const columns: DataTableColumn<{ id: string; name: string; description?: string; createdAt: string }>[] = [
    { key: 'name', header: t('common.name'), cell: (r) => r.name },
    { key: 'description', header: t('common.description'), cell: (r) => r.description ?? '—' },
    { key: 'createdAt', header: t('common.created'), cell: (r) => new Date(r.createdAt).toLocaleString(), className: 'hidden sm:table-cell' },
  ]

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="border-b bg-background">
        <div className="container mx-auto p-4">
          <PageHeader title={t('common.items')} description={t('common.manageItems')} />
        </div>
      </div>
      <div className="container mx-auto max-w-3xl p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('common.create')}</CardTitle>
            <CardDescription>{t('common.contractDriven')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.name')}</Label>
                <Input placeholder={t('common.name')} {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label>{t('common.description')}</Label>
                <Textarea placeholder={t('common.description')} rows={3} {...form.register('description')} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('common.creating') : t('common.create')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {listQuery.isLoading ? (
          <Card><CardContent className="p-6">{t('common.loading')}</CardContent></Card>
        ) : listQuery.data?.items.length === 0 ? (
          <EmptyState title={t('common.noResults')} description={t('common.create')} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <DataTable data={listQuery.data?.items ?? []} columns={columns} getRowKey={(r) => r.id} emptyText={t('common.noResults')} />
              {listQuery.data && (listQuery.data as { totalPages: number }).totalPages > 1 && (
                <DataTablePagination page={page} totalPages={(listQuery.data as { totalPages: number }).totalPages} onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p }) })} pageLabel={(currentPage, pages) => t('common.pageOf', { page: currentPage, totalPages: pages })} previousLabel={t('common.previous')} nextLabel={t('common.next')} />
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
  writeFileIfMissing(
    path.join(rootPath, "apps", "web", "src", "routes", `${featurePlural}.tsx`),
    routeContent,
  );
}

module.exports = { generateWeb };
