import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

export default function HomeTab() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">{t("home.title")}</Text>
      <Text className="mt-2 text-muted-foreground">{t("home.description")}</Text>
    </View>
  );
}
