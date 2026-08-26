import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@repo/ui";
import { TenantStatusResponseSchema, type OrganizationResponse } from "@repo/contracts";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

const ORGANIZATION_PAGE_SIZE = 100;

export function TenantSwitcher() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const selectTenant = useTenantStore((state) => state.selectTenant);

  const status = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => TenantStatusResponseSchema.parse((await api.tenancy.status()).body),
    staleTime: Infinity,
  });

  const organizations = useQuery<OrganizationResponse[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await api.tenancy.listOrganizations({
        query: { page: 1, limit: ORGANIZATION_PAGE_SIZE },
      });
      return response.status === 200 ? response.body.items : [];
    },
    enabled: status.data?.mode === "multi",
  });

  const createOrganization = useMutation({
    mutationFn: async (organizationName: string) => {
      const response = await api.tenancy.createOrganization({ body: { name: organizationName } });
      if (response.status !== 201) throw new Error("create-organization-failed");
      return response.body as OrganizationResponse;
    },
    onSuccess: async (organization: OrganizationResponse) => {
      selectTenant(organization.id);
      setName("");
      queryClient.setQueryData<OrganizationResponse[]>(["organizations"], (current) => [
        ...(current ?? []),
        organization,
      ]);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  useEffect(() => {
    const items = organizations.data ?? [];
    if (!activeTenantId && items[0]) selectTenant(items[0].id);
    const first = items[0];
    if (
      activeTenantId &&
      first &&
      !organizations.isFetching &&
      !items.some((item) => item.id === activeTenantId)
    ) {
      selectTenant(first.id);
    }
  }, [activeTenantId, organizations.data, organizations.isFetching, selectTenant]);

  if (status.data?.mode !== "multi") return null;

  const items = organizations.data ?? [];
  if (items.length > 0) {
    return (
      <select
        aria-label={t("tenancy.activeOrganization")}
        className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring shadow-2xs"
        value={activeTenantId ?? ""}
        onChange={(event) => selectTenant(event.target.value)}
      >
        {items.map((organization) => (
          <option key={organization.id} value={organization.id}>
            {organization.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim()) createOrganization.mutate(name.trim());
      }}
    >
      <Input
        aria-label={t("tenancy.organizationName")}
        placeholder={t("tenancy.organizationName")}
        value={name}
        className="h-8 text-xs"
        onChange={(event) => setName(event.target.value)}
      />
      <Button type="submit" size="sm" className="h-8 px-2.5 text-xs" disabled={createOrganization.isPending}>
        {t("tenancy.createOrganization")}
      </Button>
    </form>
  );
}
