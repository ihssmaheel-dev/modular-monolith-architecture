import { useEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TenantStatusResponseSchema, type OrganizationResponse } from "@repo/contracts";
import { api } from "../lib/api";
import { useTenantStore } from "../stores/tenant.store";

const ORGANIZATION_PAGE_SIZE = 100;

export function TenantSettings() {
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
    mutationFn: async () => {
      const response = await api.tenancy.createOrganization({ body: { name: name.trim() } });
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
    const first = organizations.data?.[0];
    if (!activeTenantId && first) selectTenant(first.id);
  }, [activeTenantId, organizations.data, selectTenant]);

  if (status.data?.mode !== "multi") return null;
  return (
    <View className="gap-3 rounded-lg border border-border bg-card p-4">
      <Text className="text-sm font-medium text-muted-foreground">
        {t("tenancy.activeOrganization")}
      </Text>
      <FlatList
        horizontal
        data={organizations.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-2"
        renderItem={({ item }) => (
          <TouchableOpacity
            className={
              item.id === activeTenantId
                ? "rounded bg-primary p-3"
                : "rounded border border-border p-3"
            }
            onPress={() => selectTenant(item.id)}
          >
            <Text
              className={item.id === activeTenantId ? "text-primary-foreground" : "text-foreground"}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TextInput
        className="rounded border border-border px-3 py-2 text-foreground"
        placeholder={t("tenancy.organizationName")}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        className="rounded bg-primary py-3"
        disabled={!name.trim() || createOrganization.isPending}
        onPress={() => createOrganization.mutate()}
      >
        <Text className="text-center font-medium text-primary-foreground">
          {t("tenancy.createOrganization")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
