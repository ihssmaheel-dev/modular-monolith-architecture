import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Input, Label, Button } from "@repo/ui";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

export function CreateOrgDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const selectTenant = useTenantStore((s) => s.selectTenant);
  const [name, setName] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      const r = await api.tenancy.createOrganization({ body: { name } });
      if (r.status !== 201) throw new Error("create failed");
      return r.body;
    },
    onSuccess: (org) => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      selectTenant(org.id);
      setName("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{t("tenancy.createOrganization")}</DialogTitle>
          <DialogDescription className="text-xs">{t("tenancy.createOrganizationDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-xs font-medium">{t("tenancy.orgName")}</Label>
            <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc" className="h-9" />
          </div>
          <Button onClick={() => m.mutate()} disabled={!name.trim() || m.isPending} className="w-full h-9 font-medium">
            {m.isPending ? t("common.creating") : t("tenancy.create")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
