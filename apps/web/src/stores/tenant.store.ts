import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined as unknown as Storage)),
    },
  ),
)
