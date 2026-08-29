import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { PageHeader } from '@repo/ui/components/composed/page-header'
import { LogOut, FileText, Users, Building2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { getApiClient } from '@/lib/api'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user
    if (!user) throw redirect({ to: '/auth' })
  },
  loader: async ({ context }) => {
    const qc = context.queryClient
    await qc.ensureQueryData({
      queryKey: ['notes', 'list', { page: 1, limit: 5 }],
      queryFn: async () => {
        const client = getApiClient()
        const res = await client.notes.list({ page: 1, limit: 5 } as never)
        if (res.status !== 200) throw new Error('Failed to load notes')
        return res.body
      },
    })
  },
  errorComponent: DashboardError,
  pendingComponent: () => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Loading dashboard...</p>
    </div>
  ),
  component: DashboardPage,
})

function DashboardError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Failed to load dashboard</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const notesQuery = useQuery({
    queryKey: ['notes', 'list', { page: 1, limit: 5 }],
    queryFn: async () => {
      const client = getApiClient()
      const res = await client.notes.list({ page: 1, limit: 5 } as never)
      if (res.status !== 200) throw new Error('Failed to load notes')
      return res.body
    },
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t('errors.unauthorized')}</CardTitle>
            <CardDescription>{t('auth.loginDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to="/auth" />} className="w-full">
              {t('auth.login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="font-semibold">
            {t('common.appName')} — {t('dashboard.title')}
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{user.email}</Badge>
            <Badge>{user.role}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const client = getApiClient()
                await client.auth.logout()
                clearAuth()
                navigate({ to: '/auth' })
              }}
            >
              <LogOut className="size-3.5" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <PageHeader
          title={t('dashboard.welcome', { name: user.name })}
          description={t('dashboard.subtitle')}
          className="mb-6"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <FileText className="size-4" /> {t('dashboard.stats.users')}
              </CardDescription>
              <CardTitle className="text-2xl">{notesQuery.data?.total ?? '—'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('notes.description')}</p>
              <Button variant="outline" size="sm" className="mt-3" render={<Link to="/notes" />}>
                {t('notes.title')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="size-4" /> {t('users.title')}
              </CardDescription>
              <CardTitle className="text-2xl">—</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('users.manage')}</p>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                {t('users.list')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="size-4" /> {t('tenancy.organization')}
              </CardDescription>
              <CardTitle className="text-2xl">
                <Badge variant="secondary">{t('settings.activeTenant')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('tenancy.createOrganizationDescription')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('notes.title')}</CardTitle>
              <CardDescription>{t('notes.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {notesQuery.isLoading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
              {notesQuery.isError && (
                <p className="text-sm text-destructive">{t('notes.loading')}: {t('errors.networkError')}</p>
              )}
              {notesQuery.data && (
                <div className="space-y-2">
                  {notesQuery.data.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('notes.noNotes')}</p>
                  ) : (
                    notesQuery.data.items.map((note: { id: string; title: string; content: string }) => (
                      <div key={note.id} className="rounded-lg border p-3">
                        <p className="font-medium text-sm">{note.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
