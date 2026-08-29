import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthResponse } from '@repo/contracts'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthResponse['user'] | null
  setAuth: (response: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (response) =>
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined as unknown as Storage)),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
