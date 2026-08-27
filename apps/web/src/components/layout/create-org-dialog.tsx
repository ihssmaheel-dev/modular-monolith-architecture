import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui";
import { type OrganizationResponse } from "@repo/contracts";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

interface CreateOrgDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrgDialog({ open, onOpenChange }: CreateOrgDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newOrgName, setNewOrgName] = useState("");
  const selectTenant = useTenantStore((state) => state.selectTenant);

  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.tenancy.createOrganization({ body: { name } });
      if (response.status !== 201) throw new Error("create-organization-failed");
      return response.body as OrganizationResponse;
    },
    onSuccess: async (organization: OrganizationResponse) => {
      selectTenant(organization.id);
      setNewOrgName("");
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
  );
}
