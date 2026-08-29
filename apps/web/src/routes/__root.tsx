import { createRootRouteWithContext, Outlet, HeadContent, Scripts, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@repo/ui/components/ui/toast'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { QueryProvider } from '@/lib/query-client'
import { I18nProvider } from '@/lib/i18n'
import '@repo/ui/globals.css'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Modular Monolith — TanStack Start' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
  pendingComponent: () => (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  ),
})

function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The page you are looking for does not exist.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link to="/" />} className="w-full">
            Back to home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function RootError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>{error.message || 'An unexpected error occurred'}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button className="flex-1" render={<Link to="/" />}>
            Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background font-sans antialiased isolation-auto">
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider defaultTheme="system" storageKey="theme">
              <div id="root">
                <Outlet />
              </div>
              <Toaster />
              <TanStackRouterDevtools position="bottom-right" />
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
