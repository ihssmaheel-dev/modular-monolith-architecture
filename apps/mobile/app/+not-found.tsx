import { Text, View } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background p-6">
      <Text className="text-xl font-bold text-foreground">{t("errors.notFound")}</Text>
      <Text className="text-center text-sm text-muted-foreground">{t("errors.notFound")}</Text>
      <Link href="/" className="text-sm font-medium text-foreground underline">
        {t("common.back")}
      </Link>
    </View>
  );
}
