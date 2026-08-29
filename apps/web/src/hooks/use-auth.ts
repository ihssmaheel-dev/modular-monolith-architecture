import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const { user, accessToken, refreshToken } = useAuthStore()
  const isAuthenticated = !!accessToken && !!user
  return { user, accessToken, refreshToken, isAuthenticated }
}
