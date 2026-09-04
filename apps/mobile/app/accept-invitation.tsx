import { Pressable, Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { AcceptInvitationSchema } from "@repo/contracts";
import { acceptInvitationMutationOptions } from "@/features/tenancy/tenancy.mutations";
import { useAuthStore } from "@/stores/auth.store";

export default function AcceptInvitation() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { token } = useLocalSearchParams<{ token?: string }>();
  const value = typeof token === "string" ? token : "";
  const isValidToken = AcceptInvitationSchema.safeParse({ token: value }).success;
  const mutation = useMutation({ ...acceptInvitationMutationOptions() });

  if (!isValidToken) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <View className="w-full max-w-md gap-3 rounded-2xl bg-card p-5 shadow-sm">
          <Text className="text-xl font-bold text-foreground">{t("tenancy.invalidInvitationLink")}</Text>
          <Text className="text-sm text-muted-foreground">{t("tenancy.invalidInvitationDescription")}</Text>
          <Link href="/(auth)/login" className="text-center text-sm font-medium underline">
            {t("auth.backToLogin")}
          </Link>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <View className="w-full max-w-md gap-3 rounded-2xl bg-card p-5 shadow-sm">
          <Text className="text-xl font-bold text-foreground">{t("tenancy.acceptInvitation")}</Text>
          <Text className="text-sm text-muted-foreground">{t("tenancy.signInToAccept")}</Text>
          <Link
            href={{ pathname: "/(auth)/login", params: { inviteToken: value } }}
            className="rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground"
          >
            {t("auth.signIn")}
          </Link>
        </View>
      </View>
    );
  }

  if (mutation.isSuccess) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <View className="w-full max-w-md items-center gap-3 rounded-2xl bg-card p-5 shadow-sm">
          <Text className="text-xl font-bold text-foreground">{t("tenancy.invitationAccepted")}</Text>
          <Text className="text-center text-sm text-muted-foreground">
            {t("tenancy.invitationAcceptedDescription")}
          </Text>
          <Link
            href="/(tabs)"
            className="w-full rounded-lg bg-primary py-3 text-center font-semibold text-primary-foreground"
          >
            {t("tenancy.goToWorkspace")}
          </Link>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <View className="w-full max-w-md gap-3 rounded-2xl bg-card p-5 shadow-sm">
        <Text className="text-xl font-bold text-foreground">{t("tenancy.acceptInvitation")}</Text>
        <Text className="text-sm text-muted-foreground">{t("tenancy.acceptInvitationDescription")}</Text>
        {mutation.isError && (
          <Text className="text-sm text-destructive">{t("tenancy.acceptFailed")}</Text>
        )}
        <Pressable
          className="rounded-lg bg-primary py-3 disabled:opacity-50"
          disabled={mutation.isPending}
          onPress={() => mutation.mutate(value)}
        >
          <Text className="text-center font-semibold text-primary-foreground">
            {mutation.isPending ? t("tenancy.accepting") : t("tenancy.accept")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
