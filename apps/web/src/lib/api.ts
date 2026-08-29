import { createApiClient, type ApiClient } from '@repo/api-client'
import { getWebEnv } from './env'
import { useAuthStore } from '@/stores/auth.store'
import { useLocaleStore } from '@/stores/locale.store'
import { useTenantStore } from '@/stores/tenant.store'

let client: ApiClient | null = null

export function getApiClient(): ApiClient {
  if (client) return client

  const env = getWebEnv()

  client = createApiClient(env.VITE_API_URL, {
    getAccessToken: () => useAuthStore.getState().accessToken,
    getRefreshToken: () => useAuthStore.getState().refreshToken,
    getLocale: () => useLocaleStore.getState().locale,
    getTenantId: () => useTenantStore.getState().tenantId,
    onAuthRefreshed: (response) => {
      useAuthStore.getState().setAuth(response)
    },
    onAuthFailure: () => {
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth'
      }
    },
  })

  return client
}

export function resetApiClient() {
  client = null
}
