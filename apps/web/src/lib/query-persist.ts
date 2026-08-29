import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query'

const PERSIST_KEY = 'web-query-cache'

export function persistQueryClient(queryClient: QueryClient) {
  if (typeof window === 'undefined') return
  try {
    const dehydrated = dehydrate(queryClient, { shouldDehydrateQuery: () => true })
    localStorage.setItem(PERSIST_KEY, JSON.stringify(dehydrated))
  } catch {
    // ignore quota errors
  }
}

export function restoreQueryClient(queryClient: QueryClient) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return
    const dehydrated = JSON.parse(raw)
    hydrate(queryClient, dehydrated)
  } catch {
    // ignore parse errors
  }
}

export function setupQueryPersist(queryClient: QueryClient) {
  if (typeof window === 'undefined') return () => {}
  let timeout: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => persistQueryClient(queryClient), 1000)
  })
  return unsubscribe
}
