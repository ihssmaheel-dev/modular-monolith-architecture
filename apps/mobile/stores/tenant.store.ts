import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface TenantState {
  activeTenantId: string | null;
  selectTenant: (tenantId: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      selectTenant: (activeTenantId) => set({ activeTenantId }),
      clearTenant: () => set({ activeTenantId: null }),
    }),
    { name: "tenant-storage", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
