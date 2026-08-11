import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function UsersLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: t("users.profile") }} />
    </Stack>
  );
}
