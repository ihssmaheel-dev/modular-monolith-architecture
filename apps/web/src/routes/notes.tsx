import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateNoteSchema, PaginationQuerySchema, type CreateNoteDto } from '@repo/contracts'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { Badge } from '@repo/ui/components/ui/badge'
import { Skeleton } from '@repo/ui/components/ui/skeleton'
import { DataTable, type DataTableColumn, DataTablePagination } from '@repo/ui/components/composed/data-table'
import { PageHeader } from '@repo/ui/components/composed/page-header'
import { ConfirmDialog } from '@repo/ui/components/composed/confirm-dialog'
import { EmptyState } from '@repo/ui/components/composed/empty-state'
import { toast } from '@repo/ui/components/ui/toast'
import { Plus, Trash2, FileText } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { getApiClient } from '@/lib/api'

export const Route = createFileRoute('/notes')({
  validateSearch: PaginationQuerySchema,
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (!user) throw redirect({ to: '/auth' })
  },
  loaderDeps: ({ search }) => ({ page: search.page, limit: search.limit }),
  loader: async ({ deps, context }) => {
    const qc = context.queryClient
    await qc.ensureQueryData({
      queryKey: ['notes', { page: deps.page, limit: deps.limit }],
      queryFn: async () => {
        const client = getApiClient()
        const res = await client.notes.list({ page: deps.page, limit: deps.limit } as never)
        if (res.status !== 200) throw new Error('Failed to fetch notes')
        return res.body
      },
    })
  },
  errorComponent: NotesError,
  pendingComponent: () => (
    <div className="min-h-svh bg-muted/20 p-6">
      <div className="container mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  ),
  component: NotesPage,
})

function NotesError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Failed to load notes</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} className="w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function NotesPage() {
  const { t } = useTranslation()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const page = search.page ?? 1
  const limit = search.limit ?? 20

  const notesQuery = useQuery({
    queryKey: ['notes', { page, limit }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page, limit } as never)
      if (res.status !== 200) throw new Error(t('api.note.fetchFailed'))
      return res.body
    },
  })

  const form = useForm<CreateNoteDto>({
    resolver: zodResolver(CreateNoteSchema),
    defaultValues: { title: '', content: '' },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateNoteDto) => {
      const client = getApiClient()
      const res = await client.notes.create({ body: data } as never)
      if (res.status !== 201) throw new Error(t('api.note.createFailed'))
      return res.body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      form.reset()
      toast.add({ title: t('api.note.created'), type: 'success' } as never)
    },
    onError: () => {
      toast.add({ title: t('api.note.createFailed'), type: 'error' } as never)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const client = getApiClient()
      const res = await client.notes.remove(id)
      if (res.status !== 204) throw new Error(t('api.note.deleteFailed'))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.add({ title: t('api.note.deleted'), type: 'success' } as never)
    },
    onError: () => {
      toast.add({ title: t('api.note.deleteFailed'), type: 'error' } as never)
    },
  })

  const columns: DataTableColumn<{ id: string; title: string; content: string; createdAt: string }>[] = [
    {
      key: 'title',
      header: t('notes.noteTitle'),
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: 'content',
      header: t('notes.content'),
      cell: (row) => <span className="line-clamp-2 text-muted-foreground">{row.content}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (row) => <span className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</span>,
      className: 'hidden sm:table-cell',
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <ConfirmDialog
          title={t('common.delete')}
          description={`Delete "${row.title}"? This cannot be undone.`}
          confirmText={t('common.delete')}
          variant="destructive"
          onConfirm={() => deleteMutation.mutate(row.id)}
          trigger={<Button variant="ghost" size="icon-sm" aria-label={t('common.delete')}><Trash2 className="size-3.5" /></Button>}
        />
      ),
      className: 'w-12',
    },
  ]

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <PageHeader title={t('notes.title')} description={t('notes.description')} className="py-0" />
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Total: {notesQuery.data?.total ?? '—'}
            </Badge>
            <Button variant="ghost" size="sm" render={<Link to="/" />}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" /> {t('notes.createNote')}
            </CardTitle>
            <CardDescription>{t('notes.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('notes.noteTitle')}</Label>
                <Input id="title" placeholder={t('notes.noteTitlePlaceholder')} {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">{t('notes.content')}</Label>
                <Textarea id="content" placeholder={t('notes.contentPlaceholder')} rows={3} {...form.register('content')} />
                {form.formState.errors.content && (
                  <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
                )}
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? t('notes.creating') : t('notes.createButton')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {notesQuery.isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : notesQuery.isError ? (
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">{t('errors.networkError')}</CardTitle>
              <CardDescription>{t('api.note.fetchFailed')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => notesQuery.refetch()}>
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        ) : notesQuery.data?.items.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-8" />}
            title={t('notes.noNotes')}
            description={t('notes.description')}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('notes.title')} <Badge variant="secondary">{notesQuery.data?.total} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                data={notesQuery.data?.items ?? []}
                columns={columns}
                getRowKey={(row) => row.id}
                isLoading={notesQuery.isFetching}
              />
              {notesQuery.data && notesQuery.data.totalPages > 1 && (
                <DataTablePagination
                  page={page}
                  totalPages={notesQuery.data.totalPages}
                  onPageChange={(next) => navigate({ search: (prev) => ({ ...prev, page: next }) })}
                />
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
