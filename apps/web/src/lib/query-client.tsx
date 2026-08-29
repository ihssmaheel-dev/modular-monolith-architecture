import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { restoreQueryClient, setupQueryPersist } from './query-persist'

let client: QueryClient | null = null

function makeQueryClient() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        gcTime: 1000 * 60 * 60 * 24,
      },
      mutations: {
        retry: 0,
      },
    },
  })
  if (typeof window !== 'undefined') {
    restoreQueryClient(qc)
    setupQueryPersist(qc)
  }
  return qc
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  }
  if (!client) client = makeQueryClient()
  return client
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => getQueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
