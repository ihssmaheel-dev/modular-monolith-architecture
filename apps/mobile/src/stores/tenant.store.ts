import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

const secureStorage = {
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
}

interface TenantState {
  tenantId: string | null
  setTenantId: (tenantId: string | null) => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      setTenantId: (tenantId) => set({ tenantId }),
    }),
    {
      name: 'tenant-storage',
      storage: createJSONStorage(() => secureStorage as unknown as Storage),
    },
  ),
)
