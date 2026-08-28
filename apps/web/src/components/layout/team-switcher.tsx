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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@repo/ui";
import { Building2, ChevronsUpDown, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { CreateOrgDialog } from "./create-org-dialog";
import { useActiveOrganization } from "@/hooks/use-active-organization";

export function TeamSwitcher() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const { activeOrganization, displayName, organizations } = useActiveOrganization();
  const activeTenantId = useTenantStore((s) => s.activeTenantId);
  const selectTenant = useTenantStore((s) => s.selectTenant);

  const { data: status } = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => (await api.tenancy.status()).body,
    staleTime: Infinity,
  });

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeOrganization ? t("tenancy.organization") : "B12 Enterprise"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 opacity-60" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side={isMobile ? "bottom" : "right"} sideOffset={4} className="w-64 rounded-xl p-1.5">
              <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">{t("tenancy.switcherLabel")}</DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => selectTenant(org.id)}
                  className={`gap-2.5 p-2 rounded-lg ${activeTenantId === org.id ? "bg-accent text-accent-foreground" : ""}`}
                >
                  <div className="flex size-7 items-center justify-center rounded-md border bg-background">
                    <Building2 className="size-3.5" />
                  </div>
                  <span className="truncate text-sm font-medium">{org.name}</span>
                </DropdownMenuItem>
              ))}
              {status?.mode === "multi" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setOpen(true)} className="gap-2 p-2">
                    <div className="flex size-7 items-center justify-center rounded-md border bg-background">
                      <Plus className="size-3.5" />
                    </div>
                    <span className="text-sm font-medium">{t("tenancy.createOrganization")}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateOrgDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
