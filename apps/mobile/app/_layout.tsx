import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { initI18n } from "../lib/i18n";
import { useTranslation } from "react-i18next";
import "../global.css";

export default function RootLayout() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="users/[id]" options={{ title: t("users.profile") }} />
      </Stack>
    </QueryClientProvider>
  );
}
