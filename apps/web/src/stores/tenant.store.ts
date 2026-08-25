import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearQueryCache } from "@/lib/query-client";

interface TenantState {
  activeTenantId: string | null;
  selectTenant: (tenantId: string) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      activeTenantId: null,
      selectTenant: (activeTenantId) => {
        set({ activeTenantId });
        clearQueryCache();
      },
      clearTenant: () => {
        set({ activeTenantId: null });
        clearQueryCache();
      },
    }),
    { name: "tenant-storage" },
  ),
);
