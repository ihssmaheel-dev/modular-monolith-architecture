import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@repo/ui";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { TenantStatusResponseSchema, type OrganizationResponse } from "@repo/contracts";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { CreateOrgDialog } from "./create-org-dialog";

export function TeamSwitcher() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const [createOpen, setCreateOpen] = useState(false);
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

  const activeOrg = organizations.data?.find((org) => org.id === activeTenantId) ?? organizations.data?.[0];
  const orgDisplayName = activeOrg?.name ?? (status.data?.mode === "multi" ? "Select Organization" : "Acme Inc");

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{orgDisplayName}</span>
                  <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {t("tenancy.activeOrganization")}
              </DropdownMenuLabel>
              {organizations.data?.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => selectTenant(org.id)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  <span className="truncate font-medium">{org.name}</span>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              {status.data?.mode === "multi" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setCreateOpen(true)}
                    className="gap-2 p-2 cursor-pointer text-primary"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">
                      {t("tenancy.createOrganization")}
                    </div>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrgDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
