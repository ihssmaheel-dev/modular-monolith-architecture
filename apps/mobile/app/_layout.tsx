import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryProvider } from "@/lib/query-client";
import "../global.css";

export default function RootLayout() {
  return (
    <QueryProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryProvider>
  );
}
