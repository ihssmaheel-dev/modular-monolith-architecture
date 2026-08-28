import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

export function useActiveOrganization() {
  const activeTenantId = useTenantStore((s) => s.activeTenantId);

  const { data: status } = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => (await api.tenancy.status()).body,
    staleTime: Infinity,
  });

  const { data: organizations } = useQuery({
    queryKey: ["organizations", { mode: status?.mode }],
    queryFn: async () => {
      if (status?.mode !== "multi") return [];
      const r = await api.tenancy.listOrganizations({ query: { page: 1, limit: 100 } });
      return r.status === 200 ? r.body.items : [];
    },
    enabled: !!status,
    staleTime: 2 * 60 * 1000,
  });

  const activeOrganization = organizations?.find((o) => o.id === activeTenantId) ?? organizations?.[0] ?? null;
  const displayName = activeOrganization?.name ?? (status?.mode === "multi" ? "Select workspace" : "Acme Inc");

  return { status, organizations, activeOrganization, displayName, activeTenantId };
}
