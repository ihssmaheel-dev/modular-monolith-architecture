import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'
import type { AuthResponse } from '@repo/contracts'

type PersistedAuth = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthResponse['user'] | null
}

const secureStorage = {
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
}

interface AuthState extends PersistedAuth {
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
      storage: createJSONStorage(() => secureStorage as unknown as Storage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
