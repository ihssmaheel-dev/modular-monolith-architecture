const path = require("path");
const { writeFileIfMissing } = require("./utils");

function generateMobile({ mobilePath, feature, Feature, featurePlural, FeaturePlural }) {
  const featurePath = path.join(mobilePath, "src", "features", featurePlural);
  const queriesContent = `import { queryOptions } from "@tanstack/react-query";
import type { ${Feature}ListResponseDto } from "@repo/contracts";
import { getApiClient } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";

export function ${featurePlural}ListQuery(page = 1, limit = 20) {
  const tenantId = useTenantStore.getState().tenantId;
  return queryOptions<${Feature}ListResponseDto>({
    queryKey: ["${featurePlural}", tenantId, "list", { page, limit }] as const,
    queryFn: async () => {
      const response = await getApiClient().${featurePlural}.list({ query: { page, limit } });
      if (response.status !== 200) throw new Error("errors.networkError");
      return response.body;
    },
  });
}
`;

  const mutationsContent = `import { mutationOptions } from "@tanstack/react-query";
import type { Create${Feature}Dto, Update${Feature}Dto } from "@repo/contracts";
import { getApiClient } from "@/lib/api";

export function create${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ["${featurePlural}", "create"] as const,
    mutationFn: async (body: Create${Feature}Dto) => {
      const response = await getApiClient().${featurePlural}.create({ body });
      if (response.status !== 201) throw new Error("errors.serverError");
      return response.body;
    },
  });
}

export function update${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ["${featurePlural}", "update"] as const,
    mutationFn: async ({ id, ...body }: Update${Feature}Dto & { id: string }) => {
      const response = await getApiClient().${featurePlural}.update({ params: { id }, body });
      if (response.status !== 200) throw new Error("errors.serverError");
      return response.body;
    },
  });
}

export function delete${Feature}MutationOptions() {
  return mutationOptions({
    mutationKey: ["${featurePlural}", "delete"] as const,
    mutationFn: async (id: string) => {
      const response = await getApiClient().${featurePlural}.delete({ params: { id } });
      if (response.status !== 204) throw new Error("errors.serverError");
    },
  });
}
`;

  const routeContent = `import { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import type { ${Feature}ListResponseDto } from "@repo/contracts";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth.store";
import { ${featurePlural}ListQuery } from "@/features/${featurePlural}/${feature}.queries";

type ${Feature}Item = ${Feature}ListResponseDto["items"][number];

export default function ${FeaturePlural}Screen() {
  const { t } = useTranslation();
  const status = useAuthStore((state) => state.status);
  const [page, setPage] = useState(1);
  const query = useQuery({
    ...${featurePlural}ListQuery(page),
    enabled: status === "authenticated",
  });

  if (status !== "authenticated") return <Redirect href="/(auth)/login" />;

  const totalPages = query.data?.totalPages ?? 1;
  return (
    <View className="flex-1 bg-background p-4">
      <PageHeader title={t("common.items")} description={t("common.manageItems")} />
      <FlatList<${Feature}Item>
        className="mt-4"
        data={query.data?.items ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
        renderItem={({ item }) => (
          <Card>
            <Text className="text-base font-semibold text-foreground">{item.name}</Text>
            {item.description ? <Text className="mt-1 text-sm text-muted-foreground">{item.description}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={
          query.isLoading ? <ActivityIndicator className="mt-10" /> : <EmptyState title={t("common.noResults")} />
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View className="flex-row items-center justify-between py-4">
              <Text onPress={() => setPage((value) => Math.max(1, value - 1))} className="text-sm text-foreground">
                {t("common.previous")}
              </Text>
              <Text className="text-xs text-muted-foreground">{t("common.pageOf", { page, totalPages })}</Text>
              <Text onPress={() => setPage((value) => Math.min(totalPages, value + 1))} className="text-sm text-foreground">
                {t("common.next")}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
`;

  writeFileIfMissing(path.join(featurePath, `${feature}.queries.ts`), queriesContent);
  writeFileIfMissing(path.join(featurePath, `${feature}.mutations.ts`), mutationsContent);
  writeFileIfMissing(path.join(mobilePath, "app", `${featurePlural}.tsx`), routeContent);
}

module.exports = { generateMobile };
