import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TenantIdSchema } from "@repo/contracts";
import { getQueryClient } from "@/lib/query-client";
import { secureStorage } from "@/lib/secure-storage";

interface TenantState {
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantId: null,
      setTenantId: (tenantId) => {
        const validated = tenantId === null ? null : TenantIdSchema.safeParse(tenantId);
        if (validated !== null && !validated.success) return;
        if (tenantId !== useTenantStore.getState().tenantId) {
          getQueryClient().clear();
        }
        set({ tenantId: validated === null ? null : validated.data });
      },
    }),
    {
      name: "tenant-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
