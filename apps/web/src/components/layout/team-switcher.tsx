import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { TenantStatusResponseSchema, type OrganizationResponse } from "@repo/contracts";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

export function TeamSwitcher({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
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
      const response = await api.tenancy.listOrganizations({ query: { page: 1, limit: 100 } });
      return response.status === 200 ? response.body.items : [];
    },
    enabled: status.data?.mode === "multi",
  });

  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.tenancy.createOrganization({ body: { name } });
      if (response.status !== 201) throw new Error("create-organization-failed");
      return response.body as OrganizationResponse;
    },
    onSuccess: async (organization: OrganizationResponse) => {
      selectTenant(organization.id);
      setNewOrgName("");
      setCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const activeOrg = organizations.data?.find((org) => org.id === activeTenantId) ?? organizations.data?.[0];
  const orgDisplayName = activeOrg?.name ?? (status.data?.mode === "multi" ? "Select Organization" : "Acme Inc");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-hidden"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-xs font-semibold text-foreground">
                    {orgDisplayName}
                  </span>
                  <span className="block truncate text-[10px] text-muted-foreground font-medium">
                    Enterprise
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {t("tenancy.activeOrganization")}
          </DropdownMenuLabel>
          {organizations.data?.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => selectTenant(org.id)}
              className="flex items-center justify-between text-xs cursor-pointer"
            >
              <span className="truncate">{org.name}</span>
              {org.id === activeTenantId && (
                <span className="text-[10px] text-primary font-medium">Active</span>
              )}
            </DropdownMenuItem>
          ))}
          {status.data?.mode === "multi" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 text-xs cursor-pointer text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("tenancy.createOrganization")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {t("tenancy.createOrganization")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder={t("tenancy.organizationName")}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              size="sm"
              disabled={createOrganization.isPending || !newOrgName.trim()}
              onClick={() => createOrganization.mutate(newOrgName.trim())}
              className="text-xs"
            >
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
