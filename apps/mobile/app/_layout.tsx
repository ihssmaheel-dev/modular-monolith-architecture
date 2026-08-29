import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { I18nProvider, initI18n } from '@/lib/i18n'
import { restoreQueryClient, setupQueryPersist } from '@/lib/query-persist'
import '../global.css'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false, gcTime: 1000 * 60 * 60 * 24 },
      mutations: { retry: 0 },
    },
  })
}

export default function RootLayout() {
  const [queryClient] = useState(() => {
    const qc = makeQueryClient()
    // hydrate persisted cache (non-blocking)
    restoreQueryClient(qc)
    setupQueryPersist(qc)
    return qc
  })

  const [ready, setReady] = useState(false)

  useEffect(() => {
    initI18n().finally(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#111',
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Modular Monolith' }} />
          <Stack.Screen name="auth" options={{ title: 'Auth', headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="notes" options={{ title: 'Notes' }} />
        </Stack>
      </I18nProvider>
    </QueryClientProvider>
  )
}
