import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query'
import * as SecureStore from 'expo-secure-store'

const PERSIST_KEY = 'query-cache'

export async function persistQueryClient(queryClient: QueryClient) {
  try {
    const dehydrated = dehydrate(queryClient, { shouldDehydrateQuery: () => true })
    await SecureStore.setItemAsync(PERSIST_KEY, JSON.stringify(dehydrated))
  } catch {
    // ignore persist errors (SecureStore limits)
  }
}

export async function restoreQueryClient(queryClient: QueryClient) {
  try {
    const raw = await SecureStore.getItemAsync(PERSIST_KEY)
    if (!raw) return
    const dehydrated = JSON.parse(raw)
    hydrate(queryClient, dehydrated)
  } catch {
    // ignore restore errors
  }
}

export function setupQueryPersist(queryClient: QueryClient) {
  // persist on every cache change (debounced)
  let timeout: ReturnType<typeof setTimeout> | null = null
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => persistQueryClient(queryClient), 1000)
  })
  return unsubscribe
}
